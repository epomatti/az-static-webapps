output "public_ip_address" {
  value = azurerm_public_ip.main.ip_address
}

output "admin_username" {
  value = azurerm_linux_virtual_machine.main.admin_username
}
