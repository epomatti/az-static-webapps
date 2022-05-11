import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

const config = new pulumi.Config();

// Create an Azure Resource Group
const resourceGroup = new azure_native.resources.ResourceGroup("rg-static-webapp", {
    location: "westus2"
});

const staticSite = new azure_native.web.StaticSite("staticsite-demo", {
    resourceGroupName: resourceGroup.name,
    location: "westus2",
    // repositoryToken: config.requireSecret("GITHUB_ACCESS_TOKEN"),
    repositoryUrl: "https://github.com/epomatti/az-static-webapps-pulumi",
    branch: "main",
    buildProperties: {
        // appArtifactLocation: "build",
        appLocation: "frontend",
    },
    sku: {
        name: "Standard",
        tier: "Standard",
    },

})

// // Export the primary key of the Storage Account
// const storageAccountKeys = pulumi.all([resourceGroup.name, storageAccount.name]).apply(([resourceGroupName, accountName]) =>
//     storage.listStorageAccountKeys({ resourceGroupName, accountName }));
// export const primaryStorageKey = storageAccountKeys.keys[0].value;
