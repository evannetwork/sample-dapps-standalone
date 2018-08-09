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

/**
 * Create DBCP runtime.
 */
async function createRuntime() {
  const runtimeConfig = {
    accountMap: {
      '0x001De828935e8c7e4cb56Fe610495cAe63fb2612':
        '01734663843202e2245e5796cb120510506343c67915eb4f9348ac0d8c2cf22a',
    },
    ipfs: { host: 'ipfs.evan.network', port: '443', protocol: 'https' },
    web3Provider: 'wss://testcore.evan.network/ws',
  };

  // initialize dependencies
  const web3 = new Web3();
  web3.setProvider(new web3.providers.WebsocketProvider(runtimeConfig.web3Provider));
  const dfs = new dbcp.Ipfs({ remoteNode: new IpfsApi(runtimeConfig.ipfs), });

  // create runtime
  const runtime = await dbcp.createDefaultRuntime(web3, dfs, { accountMap: runtimeConfig.accountMap, });

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
