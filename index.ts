import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

const resourceGroup = new azure_native.resources.ResourceGroup("rg-static-webapp", {
});

// Networking Resources

const virtualNetwork = new azure_native.network.VirtualNetwork("virtualNetwork", {
    addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
    },
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: "vnet-static-webapp",
});

const subnetStaticSite = new azure_native.network.Subnet("subnet-001-site", {
    addressPrefix: "10.0.0.0/24",
    privateEndpointNetworkPolicies: azure_native.network.VirtualNetworkPrivateEndpointNetworkPolicies.Disabled,
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
});

const subnetVm = new azure_native.network.Subnet("subnet-002-vm", {
    addressPrefix: "10.0.10.0/24",
    privateEndpointNetworkPolicies: azure_native.network.VirtualNetworkPrivateEndpointNetworkPolicies.Enabled,
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
});

// Private DNS

const privateZone = new azure_native.network.PrivateZone("privateZone", {
    location: "Global",
    privateZoneName: "internal-pomatti.xyz",
    resourceGroupName: resourceGroup.name,
});

const virtualNetworkLink = new azure_native.network.VirtualNetworkLink("virtualNetworkLink", {
    location: "Global",
    privateZoneName: privateZone.name,
    registrationEnabled: true,
    resourceGroupName: resourceGroup.name,
    virtualNetwork: {
        id: virtualNetwork.id,
    },
    virtualNetworkLinkName: "virtualNetworkLink1",
});

// Private Static WebSite

const staticSite = new azure_native.web.StaticSite("staticsite-demo", {
    resourceGroupName: resourceGroup.name,
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

// const privateEndpoint = new azure_native.network.PrivateEndpoint("privateEndpoint", {
//     privateLinkServiceConnections: [{
//         groupIds: ["staticSites"],
//         name: "privateEndpointLink1",
//         privateLinkServiceId: staticSite.id,
//     }],
//     // customDnsConfigs: [

//     // ],
//     privateEndpointName: "pe-staticsite",
//     resourceGroupName: resourceGroup.name,
//     subnet: {
//         id: subnet.id,
//     }
// });

// const privateDNSZoneGroup = new azure_native.network.PrivateDnsZoneGroup("privateDnsZoneGroup", {
//     privateDnsZoneConfigs: [{
//         name: "config1",
//         privateDnsZoneId: privateZone.id,
//     }],
//     privateDnsZoneGroupName: privateEndpoint.name,
//     privateEndpointName: privateEndpoint.name,
//     resourceGroupName: resourceGroup.name,
// });

// Jumpbox VM for Testing

// const publicIp = new azure_native.network.PublicIPAddress("server-ip", {
//     resourceGroupName: resourceGroup.name,
//     publicIPAllocationMethod: azure_native.network.IPAllocationMethod.Dynamic,
// });

// const networkInterface = new azure_native.network.NetworkInterface("server-nic", {
//     resourceGroupName: resourceGroup.name,
//     ipConfigurations: [{
//         name: "webserveripcfg",
//         subnet: { id: subnetVM.id },
//         privateIPAllocationMethod: azure_native.network.IPAllocationMethod.Dynamic,
//         publicIPAddress: { id: publicIp.id },
//     }],
// });

// const vm = new azure_native.compute.VirtualMachine("server-vm", {
//     resourceGroupName: resourceGroup.name,
//     networkProfile: {
//         networkInterfaces: [{ id: networkInterface.id }],
//     },
//     hardwareProfile: {
//         vmSize: azure_native.compute.VirtualMachineSizeTypes.Standard_B2s,
//     },
//     osProfile: {
//         computerName: "hostname",
//         adminUsername: "azadm",
//         adminPassword: "StrongPass#789",
//         linuxConfiguration: {
//             disablePasswordAuthentication: false,
//         },
//     },
//     storageProfile: {
//         osDisk: {
//             createOption: azure_native.compute.DiskCreateOption.FromImage,
//             name: "myosdisk1",
//         },
//         imageReference: {
//             publisher: "Canonical",
//             offer: "0001-com-ubuntu-server-focal",
//             sku: "20_04-lts-gen2",
//             version: "latest",
//         },
//     },
// });
