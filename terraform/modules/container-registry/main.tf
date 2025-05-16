resource "azurerm_container_registry" "default" {
  name                          = "acr${var.workload}"
  resource_group_name           = var.resource_group_name
  location                      = var.location
  admin_enabled                 = false
  public_network_access_enabled = true

  sku = "Premium"

  network_rule_set {
    default_action = "Deny"

    ip_rule {
      action   = "Allow"
      ip_range = "${var.allowed_ip_address}/32"
    }
  }

  network_rule_bypass_option = "AzureServices"
}
