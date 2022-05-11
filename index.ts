import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

const resourceGroup = new azure_native.resources.ResourceGroup("rg-static-webapp", {
    location: "westus2"
});

const virtualNetwork = new azure_native.network.VirtualNetwork("virtualNetwork", {
    addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
    },
    location: "westus2",
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: "vnet-static-webapp",
});

const subnet = new azure_native.network.Subnet("subnet-001", {
    addressPrefix: "10.0.0.0/24",
    privateEndpointNetworkPolicies: azure_native.network.VirtualNetworkPrivateEndpointNetworkPolicies.Disabled,
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
});

const privateZone = new azure_native.network.PrivateZone("privateZone", {
    location: "Global",
    privateZoneName: "internal-pomatti.xyz",
    resourceGroupName: resourceGroup.name,
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

const privateEndpoint = new azure_native.network.PrivateEndpoint("privateEndpoint", {
    location: "westus2",
    privateLinkServiceConnections: [{
        groupIds: ["staticSites"],
        name: "privateEndpointLink1",
        privateLinkServiceId: staticSite.id,
    }],
    privateEndpointName: "pe-staticsite",
    resourceGroupName: resourceGroup.name,
    subnet: {
        id: subnet.id,
    },
});


const privateDNSZoneGroup = new azure_native.network.PrivateDnsZoneGroup("privateDnsZoneGroup", {
    privateDnsZoneConfigs: [{
        name: "config1",
        privateDnsZoneId: privateZone.id,
    }],
    privateDnsZoneGroupName: privateEndpoint.name,
    privateEndpointName: privateEndpoint.name,
    resourceGroupName: resourceGroup.name,
});
