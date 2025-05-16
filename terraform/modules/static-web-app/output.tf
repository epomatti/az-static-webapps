output "static_web_app_id" {
  value = azurerm_static_web_app.main.id
}

output "default_host_name" {
  value = azurerm_static_web_app.main.default_host_name
}
