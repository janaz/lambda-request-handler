import { IncomingHttpHeaders, OutgoingHttpHeaders, ServerResponse, IncomingMessage } from 'http';

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

const toBuffer = (param: string | Buffer | undefined): Buffer => {
  if (Buffer.isBuffer(param)) {
    return param;
  } else if (typeof param === 'string') {
    return Buffer.from(param);
  } else {
    return Buffer.alloc(0);
  }
}

export const createMockResponse = (req: IncomingMessage): ServerResponse => {
  const res = new ServerResponse(req);
  let buf: Buffer[] = [];

  const addChunk = (chunk: string | Buffer) => buf.push(toBuffer(chunk));

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
  const body = toBuffer(opts.body);
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

  let shouldPushData = contentLength > 0;

  req._read = () => {
    if (shouldPushData) {
      req.push(body);
      shouldPushData = false;
    } else {
      req.push(null);
    }
  }
  return req;
}
