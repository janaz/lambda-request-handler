const app = require('../example');
const lambda = require('../dist/compile/lambda');

const event = require('./event.json');

lambda(app)(event)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);
