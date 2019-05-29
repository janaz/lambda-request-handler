import * as http from 'http';

interface RequestOptions {
  body: string | Buffer
  method: string
  path: string
  headers: http.IncomingHttpHeaders
  remoteAddress?: string
  remotePort?: number
  secure?: boolean
}

export interface Response {
  body: Buffer,
  length: number,
  isUTF8: boolean,
  statusCode: number,
  headers: http.OutgoingHttpHeaders,

}
interface ObjectWithStringKeys<T> {
  [key: string]: T;
}
const keysToLowerCase = <T>(headers: ObjectWithStringKeys<T>): ObjectWithStringKeys<T> => {
  const keys = Object.keys(headers);
  const lowerCaseHeaders: ObjectWithStringKeys<T> = {};
  keys.forEach(k => {
    lowerCaseHeaders[k.toLowerCase()] = headers[k];
  });
  return lowerCaseHeaders;
}

export const createMockResponse = (req: http.IncomingMessage): http.ServerResponse => {
  const res = new http.ServerResponse(req);
  let buf: Buffer[] = [];
  const addChunk = (chunk: string | Buffer) => {
    if (typeof chunk === 'string') {
      buf.push(Buffer.from(chunk));
    } else if (Buffer.isBuffer(chunk)) {
      buf.push(chunk);
    }
  }
  res.write = (chunk: string | Buffer) => {
    addChunk(chunk);
    return true;
  }

  res.end = (chunk: any) => {
    addChunk(chunk);
    const responseBody = Buffer.concat(buf);
    const headers = Object.assign({}, res.getHeaders());
    res.emit('prefinish');
    const response: Response = {
      body: responseBody,
      length: Buffer.byteLength(responseBody),
      isUTF8: !!(headers['content-type'] as string || '').match(/charset=utf-8/i),
      statusCode: res.statusCode,
      headers: headers,
    }
    res.emit('finish', response);
  }
  return res;
}

export const createMockRequest = (opts: RequestOptions): http.IncomingMessage => {
  const req = new http.IncomingMessage(undefined as any);
  let body: Buffer = new Buffer(0);
  if (typeof opts.body === 'string') {
    body = Buffer.from(opts.body);
  } else if (Buffer.isBuffer(opts.body)) {
    body = opts.body;
  }
  const contentLength = Buffer.byteLength(body);
  req.method = opts.method.toUpperCase();
  req.url = opts.path;
  req.headers = keysToLowerCase(opts.headers);
  req.connection = {
    remoteAddress: opts.remoteAddress || '123.123.123.123',
    remotePort: opts.remotePort || 5757,
    encrypted: opts.secure || true,
  } as any;
  if (contentLength > 0 && !req.headers['content-length']) {
    req.headers['content-length'] = contentLength.toString();
  }

  let pushData = contentLength > 0;

  req._read = () => {
    if (pushData) {
      req.push(body);
      pushData = false;
    } else {
      req.push(null);
    }
  }
  return req;
}
