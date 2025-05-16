terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0.0"
    }
  }
}

resource "random_string" "affix" {
  numeric     = true
  length      = 3
  min_numeric = 3
}

locals {
  workload          = "contoso${random_string.affix.result}"
  my_ip_addres_cidr = "${var.my_ip_address}/32"
}

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.workload}"
  location = var.location
}

module "virtual_network" {
  source              = "./modules/virtual-network"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  workload            = local.workload
  my_ip_address_cidr  = local.my_ip_addres_cidr
}

module "monitor" {
  source              = "./modules/monitor"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  workload            = local.workload
}

module "static_web_app" {
  source                        = "./modules/static-web-app"
  resource_group_name           = azurerm_resource_group.main.name
  location                      = var.stapp_location
  workload                      = local.workload
  sku_tier                      = var.stapp_sku_tier
  sku_size                      = var.stapp_sku_size
  public_network_access_enabled = var.stapp_public_network_access_enabled
}

module "private_endpoints" {
  source                          = "./modules/private-endpoints"
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  workload                        = local.workload
  vnet_id                         = module.virtual_network.vnet_id
  private_endpoints_subnet_id     = module.virtual_network.private_endpoints_subnet_id
  static_web_app_id               = module.static_web_app.static_web_app_id
  staic_web_app_default_host_name = module.static_web_app.default_host_name
}

# module "application_gateway" {
#   source                         = "./modules/application-gateway"
#   resource_group_name            = azurerm_resource_group.main.name
#   location                       = azurerm_resource_group.main.location
#   workload                       = local.workload
#   subnet_id                      = module.virtual_network.gateway_subnet_id
#   app_gateway_private_ip_address = var.app_gateway_private_ip_address
#   app_service_default_hostname   = module.app_service.default_hostname
#   app_gateway_sku_capacity       = var.app_gateway_sku_capacity
#   app_gateway_sku_name           = var.app_gateway_sku_name
#   app_gateway_sku_tier           = var.app_gateway_sku_tier
#   app_gateway_pfx_password       = var.app_gateway_pfx_password
#   log_analytics_workspace_id     = module.monitor.log_analytics_workspace_id
# }

module "jump_server" {
  source              = "./modules/virtual-machines/jump-server"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  workload            = local.workload
  vm_size             = var.vm_size
  subnet_id           = module.virtual_network.compute_subnet_id
  vm_public_key_path  = var.vm_public_key_path
  vm_admin_username   = var.vm_admin_username
  vm_image_publisher  = var.vm_image_publisher
  vm_image_offer      = var.vm_image_offer
  vm_image_sku        = var.vm_image_sku
  vm_image_version    = var.vm_image_version
}
