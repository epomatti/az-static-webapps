# Pulumi Azure Native - Private Endpoints, Static Web App

Private static web app accessible via Private Endpoints and blocked to the internet.

Since it is not possible to use a [custom domain](https://stackoverflow.com/a/72241461/3231778) with private endpoints I deployed a private Application Gateway for the purpose of demonstration. This might not be optimal for a Static Web Site but get's the done, but it would be prohibitive if you depend on Enterprise-Edge capabilities.

<img src=".docs/staticwebapp.drawio.svg?1">

## Deployment

#### 1 - Create the infrastructure with Pulumi:

```sh
npm install

az login
pulumi up -s dev -y
```

#### 2 - Once the Static Web App is deployed, copy the deployment token `AZURE_STATIC_WEB_APPS_API_TOKEN` to GitHub as an Action secret. Triggering the pipeline will deploy the code to Azure.

#### 3 - Site should be available via Private Endpoint - Use the Jumpbox VM for testing.

The Static Web Site will be available by it's public name, but routed internally by the Private DNS Zone. External access is blocked by the Azure Firewall.

```sh
curl https://thankful-sand-084c7860f.1.azurestaticapps.net
```


For a detailed explanation check [this](https://stackoverflow.com/a/69423659/3231778) answer.

#### 4 - Application Gateway

```sh
curl http://gateway.intranet.mycompany.com
curl https://gateway.intranet.mycompany.com -k
```
---

####  Clean up

```sh
pulumi destroy -s dev -y
```

## Certificates

To generate your own certificates:

```sh
# use intranet.mycompany.com for CN
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 3650 -nodes

openssl pkcs12 -export -out keyStore.p12 -inkey key.pem -in cert.pem
```
