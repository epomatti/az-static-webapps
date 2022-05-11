# Private Azure Static Web + Pulumi


Create the infrastructure:

```sh
npm install

az login
pulumi up -y
```

Once the Static Web App is deployed, copy the deployment token `AZURE_STATIC_WEB_APPS_API_TOKEN` to GitHub as an Action secret.

Triggering the pipeline will deploy the code to Azure.


Private Endpoint DNS Configuration:

https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-dns

Shouldn't be required as there will be no runtime virtual machines.

https://docs.microsoft.com/en-us/azure/dns/private-dns-autoregistration