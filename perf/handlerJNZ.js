const app = require('../example');
const lambda = require('../dist/compile/lambda');

const L = lambda(app);

module.exports = L;
