import * as url from 'url';
const binarycase = require('binary-case');

const {createMockRequest, createMockResponse} = require('./httpMocks')

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
