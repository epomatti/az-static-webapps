resource "azurerm_static_web_app" "main" {
  name                          = "stapp-${var.workload}"
  resource_group_name           = var.resource_group_name
  location                      = var.location
  sku_tier                      = var.sku_tier
  sku_size                      = var.sku_size
  public_network_access_enabled = var.public_network_access_enabled
}
