output "jump_server_ssh_session_command" {
  value = "ssh ${module.jump_server.admin_username}@${module.jump_server.public_ip_address}"
}

output "stapp_default_host_name" {
  value = module.static_web_app.default_host_name
}
