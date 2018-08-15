# DApps tutorial - standalone
This tutorial shows how to develop DApps only using the [DBCP](https://evannetwork.github.io/dev/dbcp) library and pure JS, CSS and HTML. For detailed information and instructions have a look here: 
[evannetwork.github.io](https://evannetwork.github.io/dapps/standalone/standalone)

## Install
```bash
npm install
lerna bootstrap --hoist
```

## Basic Development
- starts an local server at http://localhost:3000
```bash
npm run serve-standalone
```

## Deployment to contract
- start ipfs deamon connected to evan.network ipfs before deploying
```bash
./scripts/go-ipfs.sh
```
```bash
npm run deploy-to-contract hello-world-dbcp
```
- create a new contract and reference your dapp
```bash
npm run deploy-to-contract hello-world-bcc
```

## Deploy to ENS

Have a look at the [deployment description](https://evannetwork.github.io/dev/deployment).