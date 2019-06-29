# lambda-request-handler

An npm module that allows your Express.js or Connect web applications to be deployed as an AWS Lambda function

Inspired by [aws-serverless-express](https://github.com/awslabs/aws-serverless-express)

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
