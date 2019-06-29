# lambda-request-handler

[![Build Status](https://travis-ci.org/janaz/lambda-request-handler.svg?branch=master)](https://travis-ci.org/janaz/lambda-request-handler)

An npm module that allows your Express.js or Connect web applications to be deployed as an AWS Lambda function

Inspired by [aws-serverless-express](https://github.com/awslabs/aws-serverless-express)

It supports `nodejs8.10` and `nodejs10.x` execution environments.

The main differences between this module and `aws-serverless-express` are
* It's using [in-process-request](https://github.com/janaz/in-process-request) module to execute app handlers in-process without having to start background http server
* Simpler setup as it doesn't require managing the internal http server
* It's faster, because it doesn't need to pass the request to the internal server through the unix socket
* It's free from issues caused by limits in Node.js http module such as header size limit

## Usage

The default export of `lambda-request-handler` is a function that takes an application handler (i.e. Express.js app instance) as an argument and returns an AWS Lambda handler function.

```sh
npm install lambda-request-handler
```

```javascript
const express = require('express')
const lambdaRequestHandler = require('lambda-request-handler')

cont app = express()

app.get('/user/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'John'
  })
})

const handler = lambdaRequestHandler(app);

module.exports = { handler }
```

If the above file in your Lambda source was called `index.js` then the name of the handler in the Lambda configuration is `index.handler`
