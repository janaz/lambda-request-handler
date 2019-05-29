const app = require('../example')

const http = require('http');
const hugeBody = require('../integration/huge.json')

const createResponse = (req) => {
  const res = new http.ServerResponse(req);
  let buf = [];
  const addChunk = (chunk, encoding) => {
    console.log("Adding chunk, encoding = ", encoding)
    if (encoding) {
      buf.push(Buffer.from(chunk));
    } else if (Buffer.isBuffer(chunk)) {
      buf.push(chunk);
    }
  }
  res.write = (chunk, encoding) => {
    console.log("write...")
    addChunk(chunk, encoding);
    return true;
  }

  res.end = (chunk, encoding) => {
    console.log("end...")
    addChunk(chunk, encoding);
    res.emit('prefinish');
    const responseBody = Buffer.concat(buf);
    res.emit('finish', {
      body: responseBody,
      length: Buffer.byteLength(responseBody),
      statusCode: res.statusCode,
      headers: Object.assign({}, res.getHeaders()),
    });
  }
  return res;
}

const createRequest = (opts) => {
  const req = new http.IncomingMessage({});
  let body = opts.body;
  if (typeof opts.body === 'string') {
    body = Buffer.from(opts.body);
  }
  req.method = opts.method.toUpperCase();
  req.url = opts.path;
  req.headers = Object.assign({}, opts.headers);
  req.connection = {
    remoteAddress: opts.remoteAddress || '123.123.123.123',
    remotePort: opts.remotePort || 5757,
    encrypted: opts.secure || true,
  };
  if (Buffer.isBuffer(body) && !req.headers['content-length']) {
    req.headers['content-length'] = Buffer.byteLength(body)
  }

  let readCalled = !Buffer.isBuffer(body);
  req._read = () => {
    if (readCalled) {
      req.push(null);
    } else {
      req.push(body);
    }
    readCalled = true;
  }
  return req;
}

let body = Buffer.from(JSON.stringify(hugeBody));

const req2 = createRequest({
  method: 'GET',
  path1: '/static/a.pdf',
  path2: '/inspect',
  path: '/static/file.txt',
  headers: {
    'host': 'a.com',
    'cookie': 'a=10;b=20;',
    'content-type': 'application/json'
  },
})
const res2 = createResponse(req2);
res2.on('finish', r => console.log(r));
app.handle(req2, res2);

// const req = new http.IncomingMessage({});

// req.method = 'GET';
// req.url = '/get/next?a=4'
// req.url = '/static/a.pdf'
// // req.url = '/inspect'
// // req.url = '/err'
// req.headers = {
//   'host': 'a.com',
//   'cookie': 'a=10;b=20;',
//   'content-length': Buffer.byteLength(body),
//   'content-type': 'application/json'
// }
// req.connection = {
//   remoteAddress: '123.123.123.123',
//   remotePort: 5757,
//   encrypted: true,
// };

// let readCalled = false;
// req._read = () => {
//   if (readCalled) {
//     req.push(null);
//   } else {
//     req.push(body);
//   }
//   readCalled = true;
// }

// const res = new http.ServerResponse(req);

// res.write = (chunk, encoding) => {
//   console.log("WRITE", Buffer.byteLength(chunk), encoding);
//   return true;
// }

// res.end = (chunk, encoding) => {
//   console.log("END", chunk, encoding, res.getHeaders(), res.statusCode)
//   res.emit('prefinish');
//   res.emit('finish');
// }

