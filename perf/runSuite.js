const suite = require('./suite');
// const memwatch = require('memwatch-next');

// memwatch.on('leak', (info) => {
//   console.log('LEAK', info)
// });

const L1 = require('./handlerJNZ');
const L2 = require('./handlerAWS');

suite(L1, () => {
  console.log('exiting');
  process.exit(0);
});

// setInterval(()=>{}, 10000);
