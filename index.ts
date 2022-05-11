import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

// const config = new pulumi.Config();

const resourceGroup = new azure_native.resources.ResourceGroup("rg-static-webapp", {
    location: "westus2"
});

const virtualNetwork = new azure_native.network.VirtualNetwork("virtualNetwork", {
    addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
    },
    location: "westus2",
    resourceGroupName: resourceGroup.name,
    subnets: [{
        addressPrefix: "10.0.0.0/24",
        name: "subnet-001"
    }],
    virtualNetworkName: "vnet-static-webapp",
});

const privateZone = new azure_native.network.PrivateZone("privateZone", {
    location: "Global",
    privateZoneName: "internal-pomatti.xyz",
    resourceGroupName: resourceGroup.name,
});

const virtualNetworkLink = new azure_native.network.VirtualNetworkLink("virtualNetworkLink", {
    location: "Global",
    privateZoneName: privateZone.name,
    registrationEnabled: false,
    resourceGroupName: resourceGroup.name,
    virtualNetwork: {
        id: virtualNetwork.id,
    },
    virtualNetworkLinkName: "virtualNetworkLink1",
});

// const privateDnsZoneGroup = new azure_native.network.PrivateDnsZoneGroup("privateDnsZoneGroup", {
//     privateDnsZoneConfigs: [{
//         privateDnsZoneId: privateZone.id,
//     }],
//     privateDnsZoneGroupName: "testPdnsgroup",
//     privateEndpointName: "testPe",
//     resourceGroupName: "rg1",
// });

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

// const staticSitePrivateEndpointConnection = new azure_native.web.StaticSitePrivateEndpointConnection("staticSitePrivateEndpointConnection", {
//     name: staticSite.name,
//     privateEndpointConnectionName: "connection",
//     privateLinkServiceConnectionState: {
//         actionsRequired: "",
//         description: "Approved by admin.",
//         status: "Approved",
//     },
//     resourceGroupName: resourceGroup.name,
// });

// const staticSiteCustomDomain = new azure_native.web.StaticSiteCustomDomain("staticSiteCustomDomain", {
//     domainName: "azstaticapp.demos.pomatti.io",
//     name: "testStaticSite0",
//     resourceGroupName: resourceGroup.name,
// });
