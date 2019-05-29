const app = require('../example')
const stream = require('stream');
const fs = require('fs');
const req = stream.Readable();
req.method = 'GET';
// req.url = '/static/file.txt'
req.url = '/get/next?a=4'
// req.url = '/inspect'
let body = Buffer.from(JSON.stringify({hello: 'world'}));

req.headers = {
  'host': 'a.com',
  'cookie': 'a=10;b=20;',
  'content-length': Buffer.byteLength(body),
  'content-type': 'application/json'
}
req.socket = {
  destroy: () => console.log("socket destroy!!")
}
req.connection = {
  remoteAddress: '123.123.123.123',
  remotePort: 5757,
  encrypted: true,
};
let readCalled = false;
req._read = (size) => {
  console.log("READ SIZE", size)
  if (readCalled) {
    req.push(null);
  } else {
    req.push(body);
  }
  readCalled = true;
}


const res = stream.Writable();

res.write = (a, b, cb) => {
  console.log("WRITE", a, b ,cb);
  if (typeof cb === 'function') {
    process.nextTick(cb);
  }
}

// req.pipe(res);

res.getHeaders = () => console.log("get headers called");
res.setHeader = () => console.log("set header called");
res._finish = () => console.log("_finish called");
res.assignSocket = () => console.log("assignSocket called");
res.detachSocket = () => console.log("detachSocket called");
res.writeContinue = () => console.log("writeContinue called");
res._implicitHeader = () => console.log("_implicitHeader called");
res.writeHead = () => console.log("writeHead called");
res.writeHeader = () => console.log("writeHeader called");
res._renderHeaders = () => console.log("_renderHeaders called");
res.setTimeout = () => console.log("setTimeout called");
res.destroy = () => console.log("destroy called");
res._send = () => console.log("_send called");
res._writeRaw = () => console.log("_writeRaw called");
res._storeHeader = () => console.log("_storeHeader called");
res.getHeader = () => console.log("getHeader called");
res.getHeaderNames = () => console.log("getHeaderNames called");
res.getHeaders = () => console.log("getHeaders called");
res.hasHeader = () => console.log("hasHeader called");
res.removeHeader = () => console.log("removeHeader called");
res._implicitHeader = () => {
  throw new Error('a');
  console.log("_implicitHeader called");
}
res.addTrailers = () => console.log("addTrailers called");
res._finish = () => console.log("_finish called");
res._flush = () => console.log("_flush called");
res._flushOutput = () => console.log("_flushOutput called");
res.flushHeaders = () => console.log("flushHeaders called");
res.flush = () => console.log("flush called");

res.finished = false;

res.on('close', (a) => console.log("!CLOSE", a))
res.on('drain', (a) => console.log("!DRAIN", a))
res.on('error', (a) => console.log("!ERROR", a))
res.on('finish', (a) => console.log("!FINISH", a))
res.on('pipe', (a) => {
  console.log("!PIPE")
  // const r = fs.createReadStream("/Users/tomasz.janowski/work/github/aws-serverless-js/example/public/file.txt");
  // const v = stream.Writable();
  // v._finish = (a, b, cb) => {
  //   console.log("XXX FIN", a, b ,cb);
  // }

  // v._write = (a, b, cb) => {
  //   console.log("XXX WRITE", a, b ,cb);
  //   process.nextTick(cb);
  // }
  // v.on('finish', () => {
  //   console.log("XXX FIN");
  // })
  // r.pipe(v);


});
res.on('unpipe', (a) => console.log("!UNPIPE", a))
res.end = (a,b,c) => console.log("END", a, b, c, res.getHeaders(), res.statusCode, res.statusMessage)
app.handle(req, res);
