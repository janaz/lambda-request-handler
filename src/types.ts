import { IncomingHttpHeaders } from 'http';

export interface StringMap<T> {
  [k: string]: T
}

export interface APIGatewayEvent {
  path: string,
  queryStringParameters: StringMap<string> | null,
  body: string | null | undefined,
  headers: IncomingHttpHeaders,
  isBase64Encoded: boolean,
  httpMethod: string,
  requestContext?: {
    elb?: {
      targetGroupArn: string,
    },
    stage?: string,
    identity?: {
      sourceIp: string,
    },
    [k: string]: any
  }
}

export interface LambdaResponseHeaders {
  multiValueHeaders: StringMap<string[]>
}

export interface LambdaResponse extends LambdaResponseHeaders {
  statusCode: number,
  body: string,
  isBase64Encoded: boolean
}
