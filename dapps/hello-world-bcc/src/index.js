/*
  Copyright (c) 2018-present evan GmbH.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// BCC core configuration
const config = {
  // web3Provider: 'ws://13.57.211.13:8546',
  web3Provider: 'ws://localhost:8546',
  nameResolver: {
    ensAddress: '0x937bbC1d3874961CA38726E9cD07317ba81eD2e1',
    ensResolver: '0xDC18774FA2E472D26aB91deCC4CDd20D9E82047e',
    labels: {
      businessCenterRoot: 'testbc.evan',
      ensRoot: 'evan',
      factory: 'factory',
      admin: 'admin',
      eventhub: 'eventhub',
      profile: 'profile',
      mailbox: 'mailbox'
    },
    domains: {
      root: ['ensRoot'],
      factory: ['factory', 'businessCenterRoot'],
      adminFactory: ['admin', 'factory', 'ensRoot'],
      businessCenter: ['businessCenterRoot'],
      eventhub: ['eventhub', 'ensRoot'],
      profile: ['profile', 'ensRoot'],
      profileFactory: ['profile', 'factory', 'ensRoot'],
      mailbox: ['mailbox', 'ensRoot'],
    },
  },
  smartAgents: {
    onboarding: {
      accountId: '0x063fB42cCe4CA5448D69b4418cb89E663E71A139',
    },
  },
  alwaysAutoGasLimit: 1.1,
}

// runtime configuration
const runtimeConfig = {
  accountMap: {
    '0x001De828935e8c7e4cb56Fe610495cAe63fb2612':
      '01734663843202e2245e5796cb120510506343c67915eb4f9348ac0d8c2cf22a',
  },
  ipfs: { host: 'ipfs.test.evan.network', port: '443', protocol: 'https' },
  web3Provider: 'wss://testcore.evan.network/ws',
};

/**
 * Smart contracts solc representation.
 */
Solc = function (SmartContracts) {
  this.SmartContracts = SmartContracts;
}

Solc.prototype.getContracts = function() {
  const shortenedContracts = {};

  Object.keys(this.SmartContracts).forEach((key) => {
    const contractKey = (key.indexOf(':') !== -1) ? key.split(':')[1] : key
    shortenedContracts[contractKey] = this.SmartContracts[key]
  })

  return shortenedContracts;
}

/**
 * Create DBCP runtime.
 */
async function createRuntime() {
  // initialize dependencies
  const web3 = new Web3();
  web3.setProvider(new web3.providers.WebsocketProvider(runtimeConfig.web3Provider));

  // load SmartContracts from ipfs externally
  const SmartContracts = await SystemJS.import('https://ipfs.test.evan.network/ipfs/QmdB15Kqy4Gwe1aSSS6grj5ftSaFbUktqVdB1G4wkBYP1G/compiled.js');
  const keyProvider = new bcc.KeyProvider(runtimeConfig.accountMap);
  keyProvider.origin = keyProvider;

  // initialize the bcc core runtime
  await bcc.createAndSet({
    accountId: Object.keys(runtimeConfig.accountMap)[0],
    coreOptions: {
      web3: web3,
      solc: new Solc(SmartContracts),
      dfsRemoteNode: bcc.IpfsRemoteConstructor(runtimeConfig.ipfs),
      config: config,
    },
    keyProvider: keyProvider,
    CoreBundle: bcc,
    SmartContracts
  });

  return bcc.CoreRuntime;
}

/**
 * Get the contract id from an url parameter or from last url hash value for iframe routing.
 * @param {string} url url that should be checked, default is window.location.href
 */
function getContractId(url) {
  // try to load contract id over url parameter
  const match = (url || window.location.href).match('[?&]contractid=([^&]+)');
  let contractId;

  if (match) {
    contractId = match[1];
  } else {
    // try to get contract id from url hash (#/.../0x00)
    contractId = (url || window.location.href).split('/').pop();
  }

  if (contractId.indexOf('0x') === 0) {
    return contractId;
  }
}

/**
 * Start Hello World sample.
 */
async function runHelloWorld() {
  window.runtime = runtime = await createRuntime();

  // get contract id from current url or from parent
  let contractId = getContractId();
  if (!contractId && window.parent) {
    contractId = getContractId(window.parent.location.href);
  }

  if (!contractId || contractId.indexOf('0x') !== 0) {
    contractId = '';

    document.getElementById('test-description').innerHTML = 'not set';
  } else {
    // load opened contract
    const contract = await runtime.description.loadContract(contractId);

    // load sample contract data
    document.getElementById('contract-id').innerHTML = contractId;
    document.getElementById('owner').innerHTML = await contract.methods.owner().call();
    document.getElementById('contract-methods').innerHTML = Object.keys(contract.methods).join(', ');
    document.getElementById('sample1').innerHTML = await contract.methods.greet().call();
    document.getElementById('sample2').innerHTML = await runtime.executor.executeContractCall(contract, 'greet');
  }

  // load contract description
  let description = await runtime.description.getDescription(
    contractId || 'dashboard.evan',
    '0x001De828935e8c7e4cb56Fe610495cAe63fb2612'
  );

  document.getElementById('test-description').value = JSON.stringify(
    description,
    null,
    2
  );
}

runHelloWorld();
