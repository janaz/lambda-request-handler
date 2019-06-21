const app = require('../example');
const awsServerlessExpress = require('aws-serverless-express');

const event = require('./event.json');
const health = require('./health.json');
const post = require('./post.json');
const static = require('./static.json');
const debug = require('debug')('testing');

const server = awsServerlessExpress.createServer(app);
const L = (event) => new Promise((resolve) => {
  awsServerlessExpress.proxy(server, event, {
    succeed: resolve
  })
});

debug('end of init');

Promise.resolve()

  .then(() => {
    return L(event)
    .then(({statusCode, headers, isBase64Encoded, body}) => console.log({body, statusCode, headers, isBase64Encoded}))
  })

  .then(() => {
    return L(health)
    .then(({statusCode, headers, isBase64Encoded}) => console.log({statusCode, headers, isBase64Encoded}))
  })

  .then(() => {
    return L(post)
    .then(({statusCode, headers, isBase64Encoded}) => console.log({statusCode, headers, isBase64Encoded}))
  })

  .then(() => {
    return L(static)
    .then(({statusCode, headers, isBase64Encoded}) => console.log({statusCode, headers, isBase64Encoded}))
  })
  .catch(console.error)

