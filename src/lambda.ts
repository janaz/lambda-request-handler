import * as url from 'url';
const binarycase = require('binary-case');

import * as http from 'http';

const createMockResponse = (req:any):any => {
  const res = new http.ServerResponse(req) as any;
  let buf: Buffer[] = [];
  const addChunk = (chunk: string | Buffer, encoding?: string) => {
    if (encoding && typeof chunk === 'string') {
      buf.push(Buffer.from(chunk));
    } else if (Buffer.isBuffer(chunk)) {
      buf.push(chunk);
    }
  }
  res.write = (chunk: string | Buffer): boolean => {
    addChunk(chunk);
    return true;
  }

  res.end = (chunk: string | Buffer, encoding?: string): void => {
    addChunk(chunk, encoding);
    const responseBody = Buffer.concat(buf);
    const headers = Object.assign({}, res.getHeaders());
    res.emit('prefinish');
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

const createMockRequest = (opts:any):any => {
  const req = new http.IncomingMessage({} as any) as any;
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

interface StringMap {
  [k: string]: string
}

interface StringOrArrayMap {
  [k: string]: string | string[]
}

interface APIGWEvent {
  path: string,
  queryStringParameters: StringMap,
  body?: string,
  headers: StringMap,
  isBase64Encoded: boolean,
  httpMethod: string,
  requestContext: {
    identity?: {
      sourceIp: string,
    }
  }
}

interface APIGWResponse {
    statusCode: number,
    headers: StringOrArrayMap,
    body: string,
    isBase64Encoded: boolean
}

interface ResponseData {
  statusCode: number,
  headers: StringOrArrayMap,
  buffer: Buffer,
  isUTF8: boolean,
}


const getPathWithQueryStringParams = (event: APIGWEvent): string => {
  return url.format({ pathname: event.path, query: event.queryStringParameters });
}

const createRequest = (event: APIGWEvent, reqOptions: any): any => {
  const req = createMockRequest({
    path: reqOptions.path,
    method: reqOptions.method,
    body: reqOptions.body,
    headers: reqOptions.headers,
    remoteAddress: event.requestContext.identity ? event.requestContext.identity.sourceIp : undefined,
  });
  return req;
};

const createResponse = (req: any, onEnd: any): any => {
  const res = createMockResponse(req);
  res.on('finish', onEnd);
  return res;
}

const handler = (app: any) => (event: APIGWEvent) => {
  return Promise.resolve()
    .then(() => {
      let headers: StringMap;
      let body: Buffer;
      if (event.body && !event.headers['content-length']) {
        body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        headers = Object.assign({}, event.headers, {'content-length': Buffer.byteLength(body)})
      } else {
        body = new Buffer(0);
        headers = event.headers;
      }

      const reqOptions = {
        method: event.httpMethod,
        path: getPathWithQueryStringParams(event),
        headers,
        body,
      };

      return new Promise<ResponseData>((resolve) => {
        const req = createRequest(event, reqOptions);
        const res = createResponse(req, (out: any) => {
            resolve({
              statusCode: out.statusCode,
              headers: out.headers,
              buffer: out.body,
              isUTF8: out.isUTF8,
            });
          }
        );
        app.handle(req, res);
      })
    })
    .then(res => {
      const headers = res.headers;
      if (headers['transfer-encoding'] === 'chunked') {
        delete headers['transfer-encoding']
      }
      Object.keys(headers)
        .forEach(h => {
          if (Array.isArray(headers[h])) {
            const arrayValue = headers[h] as string[];
            if (h === 'set-cookie') {
              arrayValue.forEach((value, i) => {
                headers[binarycase(h, i + 1)] = value
              })
              delete headers[h]
            } else {
              headers[h] = arrayValue.join(',')
            }
          }
        });
      const isBase64Encoded = !res.isUTF8;
      const body = res.buffer.toString(isBase64Encoded ? 'base64' : 'utf8');
      return {
        statusCode: res.statusCode,
        body,
        headers: headers,
        isBase64Encoded
      } as APIGWResponse;
    });
}

export = handler;
