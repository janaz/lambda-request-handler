export interface StringMap<T> {
  [k: string]: T
}

interface HttpRequestContext {
  method: string
  path: string
  protocol: string
  sourceIp: string
  userAgent: string
}

export interface APIGatewayEvent {
  path?: string,
  version?: number | string,
  queryStringParameters?: StringMap<string> | null,
  multiValueQueryStringParameters?: StringMap<string[]> | null,
  body?: string | null,
  headers?: StringMap<string> | null,
  multiValueHeaders?: StringMap<string[]> | null,
  isBase64Encoded: boolean,
  httpMethod?: string,
  requestContext?: {
    elb?: {
      targetGroupArn: string,
    },
    http?: HttpRequestContext,
    stage?: string,
    identity?: {
      sourceIp: string,
    },

    // [k: string]: any
  }
}

export interface LambdaResponseHeaders {
  headers?: StringMap<string>
  multiValueHeaders?: StringMap<string[]>
  cookies?: string[]
}

export interface LambdaResponse extends LambdaResponseHeaders {
  statusCode: number,
  body: string,
  isBase64Encoded: boolean
}

export interface LambdaContext {
  awsRequestId: string;
}
