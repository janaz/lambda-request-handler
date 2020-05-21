# lambda-request-handler

An npm module that allows your Node.js web applications to be deployed as an AWS Lambda function and invoked in response to API Gateway, HTTP API, or Application Load Balancer requests.

[![Build Status](https://travis-ci.org/janaz/lambda-request-handler.svg?branch=master)](https://travis-ci.org/janaz/lambda-request-handler)

The list of supported frameworks matches [in-process-request](https://github.com/janaz/in-process-request)
* Express.js v3
* Express.js v4
* Express.js v5
* Apollo Server v2
* Hapi v19 (only supported in `nodejs12.x` runtime)
* NestJS v7
* Connect v3
* Koa v2

Inspired by [aws-serverless-express](https://github.com/awslabs/aws-serverless-express)

It supports `nodejs10.x` and `nodejs12.x` execution environments.

The main differences between this module and `aws-serverless-express` are
* It's using [in-process-request](https://github.com/janaz/in-process-request) module to execute app handlers in-process without having to start background http server
* Simpler setup as it doesn't require managing the internal http server
* Support for applications that require asynchronous setup (for example reading config from network, or decrypting secrets from KMS)
* It's faster, because it doesn't need to pass the request to the internal server through the unix socket
* It's free from issues caused by limits in Node.js http module such as header size limit

The handler supports events from the following sources:
- API Gateway [REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-rest-api.html)
- API Gateway [HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- [Application Load Balancer](https://docs.aws.amazon.com/lambda/latest/dg/services-alb.html)

## Demo app

There's a [demo app](https://github.com/janaz/lambda-request-handler-example) showcasing the features of this library available [here](https://github.com/janaz/lambda-request-handler-example)

## Usage

The default export of `lambda-request-handler` is a function that takes an application handler (i.e. Express.js app instance) as an argument and returns an AWS Lambda handler function.

An additional header is injected into the request
* `x-aws-lambda-request-id` - AWS Lambda Request Id

```sh
$ npm install lambda-request-handler
```

### Express.js
```javascript
const express = require('express')
const lambdaRequestHandler = require('lambda-request-handler')

const app = express()

app.get('/user/:id', (req, res) => {
  res.json({
    id: req.params.id,
    lambdaRequestId: req.header('x-aws-lambda-request-id')
    name: 'John'
  })
})

const handler = lambdaRequestHandler(app)

module.exports = { handler }
```

If the above file in your Lambda source was called `index.js` then the name of the handler in the Lambda configuration is `index.handler`

#### Advanced example with asynchronous setup

Sometimes the application needs to read configuration from remote source before it can start processing requests. For example it may need to decrypt some secrets managed by KMS. For this use case a special helper `deferred` has been provided. It takes a factory function which returns a Promise that resolves to the app instance. The factory function will be called only once.

```javascript
const lambdaRequestHandler = require('lambda-request-handler')
const AWS = require('aws-sdk')
const express = require('express')

const createApp = (secret) => {
  const app = express();
  app.get('/secret', (req, res) => {
    res.json({
      secret: secret,
    })
  })
}

const myAppPromise = async () => {
  const kms = new AWS.KMS()
  const data = await kms.decrypt({
    CiphertextBlob: Buffer.from(process.env.ENCRYPTED_SECRET, 'base64')
  }).promise()
  const secret = data.Plaintext.toString('ascii')
  return createApp(secret);
};

const handler = lambdaRequestHandler.deferred(myAppPromise);

module.exports = { handler }

```

### Hapi

Please note that Hapi v19 dropped support for Node v10. The only AWS Lambda runtime that supports it is `nodejs12.x`.

```javascript
const Hapi = require('@hapi/hapi')
const lambdaRequestHandler = require('lambda-request-handler')

// create custom listener for Hapi
const myListener = new lambdaRequestHandler.HapiListener()

// Pass the custom listener to Hapi.server
const server = Hapi.server({
  listener: myListener
});

server.route({
  method: 'GET',
  path: '/',
  handler: (_request: any, _h: any) => {
    return 'Hello World!';
  }
});

const myAppPromise = async () => {
  //wait for the server to initialize
  await server.start()
  // return the request listener function
  return myListener.handler
};

const handler = lambdaRequestHandler.deferred(myAppPromise);

module.exports = { handler }
```

If the above file in your Lambda source was called `index.js` then the name of the handler in the Lambda configuration is `index.handler`

### NestJS

This example is in Typescript

```typescript
import lambdaRequestHandler from 'lambda-request-handler'

import { NestFactory } from '@nestjs/core';
import { Module, Get, Controller } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

@Controller()
class AppController {
  @Get()
  render() {
    return { hello: 'world' };
  }
}

@Module({
  imports: [],
  controllers: [AppController],
})
class AppModule {}

const getApp = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  return await lambdaRequestHandler.nestHandler(app);
}

const handler = lambdaRequestHandler.deferred(getApp);

exports = { handler }
```

If the above file in your Lambda source was called `index.ts`, compiled to `index.js` then the name of the handler in the Lambda configuration is `index.handler`
