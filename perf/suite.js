const event = require('./huge.json');
const health = require('./health.json');
const post = require('./post.json');
const static = require('./static.json');
const debug = require('debug')('testing');

const log = (a, b) => {
  // console.log(a,b);
}
debug('start');

const single = (L) => Promise.resolve()
  .then(() => {
    //console.log('1');
    return L(static)
    .then(({statusCode, headers, isBase64Encoded, body}) => log({body, statusCode, headers, isBase64Encoded}))
  })

  .then(() => {
    //console.log('2');
    return L(health)
    .then(({statusCode, headers, isBase64Encoded}) => log({statusCode, headers, isBase64Encoded}))
  })

  .then(() => {
    //console.log('3');

    return L(post)
    .then(({statusCode, headers, isBase64Encoded}) => log({statusCode, headers, isBase64Encoded}))
  })

  .then(() => {
    // console.log('4');

    return L(static)
    .then(({statusCode, headers, isBase64Encoded}) => log({statusCode, headers, isBase64Encoded}))
  })

let count = 0;
let limit = 10000;
const run = (L, cb) => {
  count++;
  if (count < limit) {
    if (count % 100 === 0) {
      console.log(count / limit);
    }
      single(L).then(() => run(L, cb));
  } else {
    console.log('finish')
    if (cb) {
      cb();
      console.log('callback')
    } else {
      console.log('no callback', L, cb)

    }
  }
}

module.exports = run;
