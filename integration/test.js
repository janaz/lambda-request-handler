const app = require('../example');
const lambda = require('../dist/compile/lambda');

const event = require('./event.json');
const health = require('./health.json');
const post = require('./post.json');
const static = require('./static.json');
const debug = require('debug')('testing');

const L = lambda(app);

debug('end of init');

L(event)
  .then(({statusCode, headers, isBase64Encoded}) => console.log({statusCode, headers, isBase64Encoded}))
  .catch(console.error);

L(health)
  .then(({statusCode, headers, isBase64Encoded}) => console.log({statusCode, headers, isBase64Encoded}))
  .catch(console.error);

L(post)
  .then(({statusCode, headers, isBase64Encoded}) => console.log({statusCode, headers, isBase64Encoded}))
  .catch(console.error);

L(static)
  .then(({statusCode, headers, isBase64Encoded}) => console.log({statusCode, headers, isBase64Encoded}))
  .catch(console.error);
