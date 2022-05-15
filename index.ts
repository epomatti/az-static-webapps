import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

let config = new pulumi.Config();

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

const subnetGateway = new azure_native.network.Subnet("App-Gateway-Subnet", {
    addressPrefix: "10.0.90.0/27",
    privateEndpointNetworkPolicies: azure_native.network.VirtualNetworkPrivateEndpointNetworkPolicies.Enabled,
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: virtualNetwork.name,
});

// Private DNS - Azure Web

const privateZone = new azure_native.network.PrivateZone("privateZone", {
    location: "global",
    privateZoneName: "privatelink.1.azurestaticapps.net",
    resourceGroupName: resourceGroup.name
}, {
    dependsOn: [virtualNetwork],
});

const virtualNetworkLink = new azure_native.network.VirtualNetworkLink("virtualNetworkLink", {
    location: "global",
    privateZoneName: privateZone.name,
    registrationEnabled: false,
    resourceGroupName: resourceGroup.name,
    virtualNetwork: {
        id: virtualNetwork.id,
    },
    virtualNetworkLinkName: "virtualNetworkLink1",
});

// Private DNS - Gateway
const privateZoneGateway = new azure_native.network.PrivateZone("privateZoneGateway", {
    location: "global",
    privateZoneName: "intranet.mycompany.com",
    resourceGroupName: resourceGroup.name
}, {
    dependsOn: [virtualNetwork],
});

const virtualNetworkLinkGateway = new azure_native.network.VirtualNetworkLink("virtualNetworkLinkGateway", {
    location: "global",
    privateZoneName: privateZoneGateway.name,
    registrationEnabled: true,
    resourceGroupName: resourceGroup.name,
    virtualNetwork: {
        id: virtualNetwork.id,
    },
    virtualNetworkLinkName: "virtualNetworkLinkGateway",
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

const privateEndpoint = new azure_native.network.PrivateEndpoint("privateEndpoint", {
    privateLinkServiceConnections: [{
        groupIds: ["staticSites"],
        name: "privateEndpointLink1",
        privateLinkServiceId: staticSite.id,
    }],
    resourceGroupName: resourceGroup.name,
    subnet: {
        id: subnetStaticSite.id,
    }
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

// Application Gateway

const applicationGatewayName = config.require("appGWName");

const buildResourceId = (type: string, name: string) => {
    return pulumi.interpolate`${resourceGroup.id}/providers/Microsoft.Network/applicationGateways/${applicationGatewayName}/${type}/${name}`
}

const subnetGatewaySubResource: pulumi.Input<azure_native.types.input.network.SubResourceArgs> = {
    id: subnetGateway.id
}

const applicationGateway = new azure_native.network.ApplicationGateway("applicationGateway", {
    applicationGatewayName: applicationGatewayName,
    backendAddressPools: [{
        backendAddresses: [
            {
                fqdn: staticSite.defaultHostname
            },
        ],
        name: "appgwpool",
    }],
    backendHttpSettingsCollection: [{
        cookieBasedAffinity: "Disabled",
        name: "appgwbhs",
        port: 443,
        protocol: "Https",
        requestTimeout: 30,
        pickHostNameFromBackendAddress: true
    }],
    frontendIPConfigurations: [{
        name: "appgwfip",
        subnet: subnetGatewaySubResource
    }],
    frontendPorts: [
        // {
        //     name: "appgwfp",
        //     port: 443,
        // },
        {
            name: "appgwfp80",
            port: 80,
        },
    ],
    gatewayIPConfigurations: [{
        name: "appgwipc",
        subnet: {
            id: pulumi.interpolate`${subnetGateway.id}`,
        },
    }],
    httpListeners: [
        // {
        //     frontendIPConfiguration: {
        //         id: buildResourceId("frontendIPConfigurations", "appgwfip"),
        //     },
        //     frontendPort: {
        //         id: "/subscriptions/subid/resourceGroups/rg1/providers/Microsoft.Network/applicationGateways/appgw/frontendPorts/appgwfp",
        //     },
        //     name: "appgwhl",
        //     protocol: "Https",
        //     requireServerNameIndication: false,
        //     sslCertificate: {
        //         id: "/subscriptions/subid/resourceGroups/rg1/providers/Microsoft.Network/applicationGateways/appgw/sslCertificates/sslcert",
        //     },
        //     sslProfile: {
        //         id: "/subscriptions/subid/resourceGroups/rg1/providers/Microsoft.Network/applicationGateways/appgw/sslProfiles/sslProfile1",
        //     },
        // },
        {
            frontendIPConfiguration: {
                id: buildResourceId("frontendIPConfigurations", "appgwfip"),
            },
            frontendPort: {
                id: buildResourceId("frontendPorts", "appgwfp80"),
            },
            name: "appgwhttplistener",
            protocol: "Http",
        },
    ],
    // identity: {
    //     type: azure_native.network.ResourceIdentityType.UserAssigned,
    //     userAssignedIdentities: {
    //         "/subscriptions/subid/resourceGroups/rg1/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity1": {},
    //     },
    // },
    requestRoutingRules: [
        {
            httpListener: {
                id: buildResourceId("httpListeners", "appgwhttplistener"),
            },
            backendHttpSettings: {
                id: buildResourceId("backendHttpSettingsCollection", "appgwbhs")
            },
            backendAddressPool: {
                id: buildResourceId("backendAddressPools", "appgwpool"),
            },
            name: "appgwBasicRule",
            ruleType: "Basic",
        },
    ],
    resourceGroupName: resourceGroup.name,
    sku: {
        capacity: 1,
        name: "Standard_Small",
        tier: "Standard",
    },
    // sslCertificates: [
    //     {
    //         data: "****",
    //         name: "sslcert",
    //         password: "****",
    //     },
    //     {
    //         keyVaultSecretId: "https://kv/secret",
    //         name: "sslcert2",
    //     },
    // ],
    // sslProfiles: [{
    //     clientAuthConfiguration: {
    //         verifyClientCertIssuerDN: true,
    //     },
    //     name: "sslProfile1",
    //     sslPolicy: {
    //         cipherSuites: ["TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256"],
    //         minProtocolVersion: "TLSv1_1",
    //         policyType: "Custom",
    //     },
    //     trustedClientCertificates: [{
    //         id: "/subscriptions/subid/resourceGroups/rg1/providers/Microsoft.Network/applicationGateways/appgw/trustedClientCertificates/clientcert",
    //     }],
    // }],
    // trustedClientCertificates: [{
    //     data: "****",
    //     name: "clientcert",
    // }],
    // trustedRootCertificates: [
    //     {
    //         data: "****",
    //         name: "rootcert",
    //     },
    //     {
    //         keyVaultSecretId: "https://kv/secret",
    //         name: "rootcert1",
    //     },
    // ],

    // urlPathMaps: [{
    //     defaultBackendAddressPool: {
    //         id: buildResourceId("backendAddressPools", "appgwpool"),
    //     },
    //     defaultBackendHttpSettings: {
    //         id: buildResourceId("backendHttpSettingsCollection", "appgwbhs"),
    //     },
    //     // defaultRewriteRuleSet: {
    //     //     id: buildResourceId("rewriteRuleSets", "rewriteRuleSet1"),
    //     // },
    //     name: "pathMap1",
    //     // pathRules: [{
    //     //     backendAddressPool: {
    //     //         id: buildResourceId("backendAddressPools", "appgwpool"),
    //     //     },
    //     //     backendHttpSettings: {
    //     //         id: buildResourceId("backendHttpSettingsCollection", "appgwbhs"),
    //     //     },
    //     //     name: "apiPaths",
    //     //     // paths: [
    //     //     //     "/*",
    //     //     //     // "/v1/api",
    //     //     // ],
    //     //     // rewriteRuleSet: {
    //     //     //     id: buildResourceId("rewriteRuleSets", "rewriteRuleSet1"),
    //     //     // },
    //     // }],
    // }],
});


// Jumpbox VM for Testing

// const publicIp = new azure_native.network.PublicIPAddress("server-ip", {
//     resourceGroupName: resourceGroup.name,
//     publicIPAllocationMethod: azure_native.network.IPAllocationMethod.Dynamic,
// });

// const networkInterface = new azure_native.network.NetworkInterface("server-nic", {
//     resourceGroupName: resourceGroup.name,
//     ipConfigurations: [{
//         name: "webserveripcfg",
//         subnet: { id: subnetVm.id },
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
