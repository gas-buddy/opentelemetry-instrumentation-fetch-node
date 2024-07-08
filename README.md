# opentelemetry-instrumentation-fetch-node

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.png?v=101)](https://github.com/ellerbrock/typescript-badges/)

![main CI](https://github.com/gas-buddy/opentelemetry-instrumentation-fetch-node/actions/workflows/nodejs.yml/badge.svg)

[![npm version](https://badge.fury.io/js/@gasbuddy%2Fopentelemetry-instrumentation-fetch-node.svg)](https://badge.fury.io/js/opentelemetry-instrumentation-fetch-node)

OpenTelemetry Node 18+ native fetch automatic instrumentation package.

Existing instrumentation packages (like [@opentelemetry/instrumentation-http](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)) do not work with Node 18+ native fetch, which is based on the [undici module](https://undici.nodejs.org/#/) but packaged in a "strange" way (some sort of internal bundle that I don't really understand). This module uses the new Node diagnostics channel to instrument native fetch.

Note that due to the fact that fetch is lazy loaded in Node, this module will kick off a "phony" fetch
to an unparseable URL (blank string) to get the library to load so we don't miss any events (because the
diagnostics channel would not yet exist).

See the tests for an example setup - note the onRequest event that allows you to add outbound headers or
span attributes or what have you.
