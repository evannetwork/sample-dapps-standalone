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
 * Create DBCP runtime.
 */
async function createRuntime() {
  // initialize dependencies
  const provider = new bcc.Web3.providers.WebsocketProvider(
    runtimeConfig.web3Provider,
    { clientConfig: { keepalive: true, keepaliveInterval: 5000 } },
  );
  const web3 = new bcc.Web3(provider, { transactionConfirmationBlocks: 1, protocol: [] })
  const dfs = new bcc.Ipfs({ dfsConfig: runtimeConfig.ipfs })

  const formattedContracts = {};
  Object.keys(smartcontracts).forEach((key) => {
    const contractKey = (key.indexOf(':') !== -1) ? key.split(':')[1] : key;
    formattedContracts[contractKey] = smartcontracts[key];
  });

  // create runtime
  const runtime = await bcc.createDefaultRuntime(web3, dfs, runtimeConfig, {
    contracts: formattedContracts,
  });

  return runtime;
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

    document.getElementById('contract-id').innerHTML = 'not set';
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
