locals {
  stapp_split = split(".", var.staic_web_app_default_host_name)
}

resource "azurerm_private_dns_zone" "static_web_app" {
  name                = "privatelink.azurestaticapps.net"
  resource_group_name = var.resource_group_name
}

resource "azurerm_private_dns_zone" "static_web_app_partition" {
  name                = "privatelink.${local.stapp_split[1]}.azurestaticapps.net"
  resource_group_name = var.resource_group_name
}

resource "azurerm_private_dns_zone_virtual_network_link" "static_web_app" {
  name                  = "static-web-app-link"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.static_web_app.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false
}

resource "azurerm_private_dns_zone_virtual_network_link" "static_web_app_partition" {
  name                  = "static-web-app-link-partition"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.static_web_app_partition.name
  virtual_network_id    = var.vnet_id
  registration_enabled  = false
}

resource "azurerm_private_endpoint" "static_web_app" {
  name                = "pe-stapp"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoints_subnet_id

  private_dns_zone_group {
    name = azurerm_private_dns_zone.static_web_app.name
    private_dns_zone_ids = [
      azurerm_private_dns_zone.static_web_app.id,
      azurerm_private_dns_zone.static_web_app_partition.id,
    ]
  }

  private_service_connection {
    name                           = "staticSites"
    private_connection_resource_id = var.static_web_app_id
    is_manual_connection           = false
    subresource_names              = ["staticSites"]
  }
}
