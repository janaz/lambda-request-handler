export interface StringMap<T> {
  [k: string]: T
}

export interface APIGatewayEvent {
  path: string,
  queryStringParameters?: StringMap<string> | null | undefined,
  multiValueQueryStringParameters?: StringMap<string[]> | null | undefined,
  body: string | null | undefined,
  headers?: StringMap<string> | null | undefined,
  multiValueHeaders?: StringMap<string[]> | null | undefined,
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
  headers?: StringMap<string> | undefined
  multiValueHeaders?: StringMap<string[]> | undefined
}

export interface LambdaResponse extends LambdaResponseHeaders {
  statusCode: number,
  body: string,
  isBase64Encoded: boolean
}

export interface LambdaContext {
  awsRequestId: string;
}
