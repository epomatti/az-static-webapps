# Private Azure Static Web + Pulumi


1 - Create the infrastructure with Pulumi:

```sh
npm install

az login
pulumi up -y
```

2 - Once the Static Web App is deployed, copy the deployment token `AZURE_STATIC_WEB_APPS_API_TOKEN` to GitHub as an Action secret. Triggering the pipeline will deploy the code to Azure.

3 - Site should be available via Private Endpoint

```source
https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-dns
https://docs.microsoft.com/en-us/azure/dns/private-dns-autoregistration
https://github.com/pulumi/examples/tree/master/azure-ts-webapp-privateendpoint-vnet-injection
```