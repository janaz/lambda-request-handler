const http = require('http');

const createResponse = (req) => {
  const res = new http.ServerResponse(req);
  let buf = [];
  const addChunk = (chunk, encoding) => {
    if (typeof chunk === 'string') {
      buf.push(Buffer.from(chunk));
    } else if (Buffer.isBuffer(chunk)) {
      buf.push(chunk);
    }
  }
  res.write = (chunk, encoding) => {
    addChunk(chunk, encoding);
    return true;
  }

  res.end = (chunk, encoding) => {
    addChunk(chunk, encoding);
    res.emit('prefinish');
    let responseBody = Buffer.concat(buf);
    if (res.body) {
      responseBody = res.body;
    }
    const headers = Object.assign({}, res.getHeaders());
    res.emit('finish', {
      body: responseBody,
      length: Buffer.byteLength(responseBody),
      isUTF8: !!(headers['content-type'] || '').match(/charset=utf-8/i),
      statusCode: res.statusCode,
      headers: headers,
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

module.exports = {createRequest, createResponse}
