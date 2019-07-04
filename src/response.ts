import { InProcessResponse } from 'in-process-request';
import { LambdaResponse } from './types';
import fixResponseHeaders from './fixResponseHeaders'

export const inProcessResponseToLambdaResponse = (response: InProcessResponse): LambdaResponse => {
  const encoding = response.isUTF8 ? 'utf8' : 'base64';
  return {
    statusCode: response.statusCode,
    body: response.body.toString(encoding),
    isBase64Encoded: encoding === 'base64',
    ...fixResponseHeaders(response.headers),
  };
};

export const errorResponse = (): LambdaResponse => {
  return {
    statusCode: 500,
    multiValueHeaders: {},
    body: '',
    isBase64Encoded: false
  };
}
