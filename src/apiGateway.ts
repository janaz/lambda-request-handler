import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';

interface StringMap {
  [k: string]: string
}

export interface APIGatewayEvent {
  path: string,
  queryStringParameters: StringMap | null,
  body: string | null | undefined,
  headers: IncomingHttpHeaders,
  isBase64Encoded: boolean,
  httpMethod: string,
  requestContext?: {
    identity?: {
      sourceIp: string,
    },
    [k: string]: any
  }
}

export interface APIGatewayResponse {
  statusCode: number,
  headers: OutgoingHttpHeaders,
  body: string,
  isBase64Encoded: boolean
}
