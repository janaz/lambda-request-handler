import * as url from 'url';
import { EventEmitter } from 'events';
import * as httpMocks from 'node-mocks-http';
const binarycase = require('binary-case');

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
    identity: {
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
  data: string,
  buffer: Buffer,
}

interface Socket {
  destroy: () => void,
}

interface MyRequest {
  unpipe: () => void,
  resume: () => void,
  socket: Socket,
  connection: {
    remoteAddress: string
  }
}

interface MyResponse {
  on: (ev: string, cb: (err?: Error) => void) => void,
}

const getPathWithQueryStringParams = (event: APIGWEvent): string => {
  return url.format({ pathname: event.path, query: event.queryStringParameters });
}

const emptyFn = () => {};

const mockSocket: Socket = { destroy: emptyFn };

const createRequest = (event: APIGWEvent, reqOptions: httpMocks.RequestOptions): httpMocks.MockRequest<MyRequest> => {
  const req: httpMocks.MockRequest<MyRequest> = httpMocks.createRequest(reqOptions);
  // interface required by 'finalhandler'
  req.unpipe = emptyFn;
  req.resume = emptyFn;
  req.socket = mockSocket;
  req.connection = { remoteAddress: event.requestContext.identity.sourceIp };
  return req;
}

const createResponse = (req: httpMocks.MockRequest<MyRequest>): httpMocks.MockResponse<MyResponse> => {
  return httpMocks.createResponse({
    eventEmitter: EventEmitter,
    req: req,
  });
}

const handler = (app: any) => (event: APIGWEvent) => {
  return Promise.resolve()
    .then(() => {
      let headers: StringMap;
      let body: Buffer;
      if (event.body && !event.headers['Content-Length']) {
        body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        headers = Object.assign({}, event.headers, {'Content-Length': Buffer.byteLength(body)})
      } else {
        body = new Buffer(0);
        headers = event.headers;
      }

      const reqOptions: httpMocks.RequestOptions = {
        method: event.httpMethod as httpMocks.RequestMethod,
        path: getPathWithQueryStringParams(event),
        headers,
      };

      const req = createRequest(event, reqOptions);
      const res = createResponse(req);
      return new Promise<ResponseData>((resolve) => {
        res.on('end', () => {
          resolve({
            statusCode: res._getStatusCode(),
            headers: res._getHeaders(),
            data: res._getData(),
            buffer: res._getBuffer(),
          });
        });
        res.on('error', (e) => {
          resolve({
            statusCode: 500,
            headers: {},
            data: e!.message,
            buffer: new Buffer(0),
          });
        });
        app.handle(req, res);
        if (body.length > 0) {
          req.send(body);
        }
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
      const isBase64Encoded = res.buffer.length > 0;
      const body = res.buffer.length > 0 ? res.buffer.toString('base64') : res.data;
      return {
        statusCode: res.statusCode,
        body,
        headers: headers,
        isBase64Encoded
      } as APIGWResponse;
    });
}

export = handler;
