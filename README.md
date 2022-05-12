# Pulumi on Azure - Private Endpoints, Static Web

Private static web app, accessible via Private Endpoints.

### Deployment

1 - Create the infrastructure with Pulumi:

```sh
npm install

az login
pulumi up -y
```

2 - Once the Static Web App is deployed, copy the deployment token `AZURE_STATIC_WEB_APPS_API_TOKEN` to GitHub as an Action secret. Triggering the pipeline will deploy the code to Azure.

3 - Site should be available via Private Endpoint - Use the Jumpbox VM for testing.


---

### Source

```source
https://docs.microsoft.com/en-us/azure/purview/catalog-private-link-name-resolution
https://docs.microsoft.com/en-us/azure/private-link/troubleshoot-private-endpoint-connectivity
https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-dns
https://docs.microsoft.com/en-us/azure/dns/private-dns-autoregistration
https://github.com/pulumi/examples/tree/master/azure-ts-webapp-privateendpoint-vnet-injection
```