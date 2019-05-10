const app = require('../example');
const lambda = require('../dist/compile/lambda');

const event = require('./event.json');
const health = require('./health.json');
const post = require('./post.json');

lambda(app)(event)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);

lambda(app)(health)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);

lambda(app)(post)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);
