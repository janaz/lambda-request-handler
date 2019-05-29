const app = require('../example');
const lambda = require('../dist/compile/lambda');

const event = require('./event.json');
const health = require('./health.json');
const post = require('./post.json');
const static = require('./static.json');

const L = lambda(app);
L(event)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);

L(health)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);

L(post)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);

  L(static)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);
