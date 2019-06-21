const app = require('../example');
const awsServerlessExpress = require('aws-serverless-express');

const server = awsServerlessExpress.createServer(app);
const L = (event) => new Promise((resolve) => {
  awsServerlessExpress.proxy(server, event, {
    succeed: resolve
  })
});
module.exports = L;
