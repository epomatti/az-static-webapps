resource "azurerm_public_ip" "default" {
  name                = "pip-agw-${var.workload}"
  resource_group_name = var.resource_group_name
  location            = var.location
  allocation_method   = "Static"
}

resource "azurerm_application_gateway" "main" {
  name                = "agw-${var.workload}"
  resource_group_name = var.resource_group_name
  location            = var.location

  sku {
    name     = var.app_gateway_sku_name
    tier     = var.app_gateway_sku_tier
    capacity = var.app_gateway_sku_capacity
  }

  gateway_ip_configuration {
    name      = "my-gateway-ip-configuration"
    subnet_id = var.subnet_id
  }

  frontend_port {
    name = "http-port"
    port = 80
  }

  frontend_port {
    name = "https-port"
    port = 443
  }

  frontend_ip_configuration {
    name                 = "public-frontend"
    public_ip_address_id = azurerm_public_ip.default.id
  }

  frontend_ip_configuration {
    name                          = "private-frontend"
    private_ip_address_allocation = "Static"
    subnet_id                     = var.subnet_id
    private_ip_address            = var.app_gateway_private_ip_address
  }

  backend_address_pool {
    name  = "address-pool"
    fqdns = [var.app_service_default_hostname]
  }

  backend_http_settings {
    name                  = "https-settings"
    cookie_based_affinity = "Disabled"
    port                  = 443
    protocol              = "Https"
    request_timeout       = 60

    pick_host_name_from_backend_address = true

    probe_name = "app-service-probe"
  }

  probe {
    name                = "app-service-probe"
    protocol            = "Https"
    path                = "/"
    interval            = 30
    timeout             = 30
    unhealthy_threshold = 3

    pick_host_name_from_backend_http_settings = true
  }

  http_listener {
    name                           = "http-listener"
    frontend_ip_configuration_name = "private-frontend"
    frontend_port_name             = "http-port"
    protocol                       = "Http"
  }

  ssl_policy {
    policy_name = "AppGwSslPolicy20170401S"
    policy_type = "Predefined"
  }

  ssl_certificate {
    name     = "gateway"
    data     = filebase64("${path.module}/../../gateway.pfx")
    password = var.app_gateway_pfx_password
  }

  http_listener {
    name                           = "https-listener"
    frontend_ip_configuration_name = "private-frontend"
    frontend_port_name             = "https-port"
    protocol                       = "Https"
    ssl_certificate_name           = "gateway"
  }

  request_routing_rule {
    name                       = "http-route"
    rule_type                  = "Basic"
    http_listener_name         = "http-listener"
    backend_address_pool_name  = "address-pool"
    backend_http_settings_name = "https-settings"
    priority                   = 9
  }

  request_routing_rule {
    name                       = "https-route"
    rule_type                  = "Basic"
    http_listener_name         = "https-listener"
    backend_address_pool_name  = "address-pool"
    backend_http_settings_name = "https-settings"
    priority                   = 10
  }
}

resource "azurerm_monitor_diagnostic_setting" "application_gateway" {
  name                       = "App Gateway Diagnostics"
  target_resource_id         = azurerm_application_gateway.main.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "ApplicationGatewayAccessLog"
  }

  enabled_log {
    category = "ApplicationGatewayPerformanceLog"
  }

  enabled_log {
    category = "ApplicationGatewayFirewallLog"
  }

  metric {
    category = "AllMetrics"
  }
}
