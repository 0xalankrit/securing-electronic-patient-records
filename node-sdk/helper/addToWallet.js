'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { Wallets } = require('fabric-network');
const path = require('path');

// const fixtures = path.resolve(__dirname, '../../');
// console.log(fixtures);
let config ={
    pathToUser:'/home/alankrit/Desktop/securing-electronic-patient-records/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com',
    pathToUserSignCert:'/home/alankrit/Desktop/securing-electronic-patient-records/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/cert.pem',
    pathToUserPrivKey:'/home/alankrit/Desktop/securing-electronic-patient-records/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/4a373fc57271fbb02967b30cbe2fbe7681df470f2f8f4ad5379282b2df54a617_sk',
    identityLabel:'User1@org1.example.com'
}

async function main() {

    // Main try/catch block
    try {
    // A wallet stores a collection of identities
    const wallet = await Wallets.newFileSystemWallet('../wallet');

    // Identity to credentials to be stored in the wallet
    const credPath = config.pathToUser;
    const certificate = fs.readFileSync(config.pathToUserSignCert).toString();
    const privateKey = fs.readFileSync(config.pathToUserPrivKey).toString();
    
    // console.log(credPath);
    // console.log(certificate);
    // console.log(privateKey);
    // Load credentials into wallet
   
    const identityLabel = config.identityLabel;

    const identity = {
        credentials: {
            certificate,
            privateKey
        },
        mspId: 'Org1MSP',
        type: 'X.509'
    }

    await wallet.put(identityLabel, identity);
    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main().then(() => {
    console.log('done');
}).catch((e) => {
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});