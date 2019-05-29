import {IncomingHttpHeaders, OutgoingHttpHeaders, ServerResponse, IncomingMessage} from 'http';

export interface MockRequestOptions {
  body: string | Buffer
  method: string
  path: string
  headers: IncomingHttpHeaders
  remoteAddress?: string
  remotePort?: number
  secure?: boolean
}

export interface MockResponse {
  body: Buffer,
  length: number,
  isUTF8: boolean,
  statusCode: number,
  headers: OutgoingHttpHeaders,

}
interface ObjectWithStringKeys<T> {
  [key: string]: T;
}
const keysToLowerCase = <T>(headers: ObjectWithStringKeys<T>): ObjectWithStringKeys<T> => {
  const lowerCaseHeaders: ObjectWithStringKeys<T> = {};
  Object.keys(headers).forEach(k => {
    lowerCaseHeaders[k.toLowerCase()] = headers[k];
  });
  return lowerCaseHeaders;
}

export const createMockResponse = (req: IncomingMessage): ServerResponse => {
  const res = new ServerResponse(req);
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
    const response: MockResponse = {
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

export const createMockRequest = (opts: MockRequestOptions): IncomingMessage => {
  const req = new IncomingMessage(undefined as any);
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
