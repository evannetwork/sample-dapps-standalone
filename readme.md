# DApps tutorial - standalone
This tutorial shows how to develop DApps only using the Blockchain Core library and pure JS, CSS and HTML.

For detailed information and instructions have a look here:
[evannetwork.github.io](https://evannetwork.github.io/docs/developers/ui/standalone.html)

## Install
```bash
npm install
```

## Basic Development
- starts an local server at http://localhost:3000
```bash
npm run serve
```
- Open Application on http://localhost:3000/hello-world-bcc/index.html


## Deployment to contract

Now yopu can deploy a own Greeter Smart Contract with the command

```bash
npm run deploy-to-contract hello-world-bcc
```

In the console you get a response like

```
created contract: "0x4B3c7b5630fc7b31CC7054f81E6De86074B23980"
```

And afterwards you can look at the call in the UI with the URL http://localhost:3000/hello-world-bcc/index.html?contractid=YOURCONTRACTID