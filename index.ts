import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

const config = new pulumi.Config();

const resourceGroup = new azure_native.resources.ResourceGroup("rg-static-webapp", {
    location: "westus2"
});

const staticSite = new azure_native.web.StaticSite("staticsite-demo", {
    resourceGroupName: resourceGroup.name,
    location: "westus2",
    repositoryUrl: "https://github.com/epomatti/az-static-webapps-pulumi",
    branch: "main",
    buildProperties: {
        appArtifactLocation: "dist",
        appLocation: "frontend",
    },
    sku: {
        name: "Standard",
        tier: "Standard",
    },

})
