variable "workload" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "log_analytics_workspace_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "app_gateway_pfx_password" {
  type      = string
  sensitive = true
}

variable "app_gateway_sku_name" {
  type = string
}

variable "app_gateway_sku_tier" {
  type = string
}

variable "app_gateway_sku_capacity" {
  type = string
}

variable "app_service_default_hostname" {
  type = string
}

variable "app_gateway_private_ip_address" {
  type = string
}
