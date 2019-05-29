import {IncomingHttpHeaders, OutgoingHttpHeaders} from 'http';

interface StringMap {
  [k: string]: string
}

export interface APIGatewayEvent {
  path: string,
  queryStringParameters: StringMap,
  body?: string,
  headers: IncomingHttpHeaders,
  isBase64Encoded: boolean,
  httpMethod: string,
  requestContext: {
    identity?: {
      sourceIp: string,
    }
  }
}

export interface APIGatewayResponse {
  statusCode: number,
  headers: OutgoingHttpHeaders,
  body: string,
  isBase64Encoded: boolean
}
