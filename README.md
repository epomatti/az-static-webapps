# Pulumi Azure Native - Private Endpoints, Static Web App

Private static web app accessible via Private Endpoints and blocked to the internet.

<img src=".docs/staticwebapp.drawio.svg" width=600>

### Deployment

1 - Create the infrastructure with Pulumi:

```sh
npm install

az login
pulumi up -s dev -y
```

2 - Once the Static Web App is deployed, copy the deployment token `AZURE_STATIC_WEB_APPS_API_TOKEN` to GitHub as an Action secret. Triggering the pipeline will deploy the code to Azure.

3 - Site should be available via Private Endpoint - Use the Jumpbox VM for testing.

The Static Web Site will be available by it's public name, but routed internally by the Private DNS Zone. External access is blocked by the Azure Firewall.

```sh
wget https://thankful-sand-084c7860f.1.azurestaticapps.net
```


For a detailed explanation check [this](https://stackoverflow.com/a/69423659/3231778) answer.

Additionally, to use a custom domain, creating a temporary TXT record [would be required](https://blog.aelterman.com/2022/01/10/azure-app-service-using-a-custom-domain-name-in-a-private-namespace/).

---

To clean up the resources:

```sh
pulumi destroy -s dev -y
```