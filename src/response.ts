import { InProcessResponse } from 'in-process-request';
import { LambdaResponse } from './types';
import fixResponseHeaders from './fixResponseHeaders'
import isUtf8 from 'isutf8'

type Encoding = 'base64' | 'utf8'
export const inProcessResponseToLambdaResponse = (response: InProcessResponse, supportMultiHeaders: boolean, supportCookies: boolean): LambdaResponse => {
  const encoding = getEncoding(response);
  return {
    statusCode: response.statusCode,
    body: response.body.toString(encoding),
    isBase64Encoded: encoding === 'base64',
    ...fixResponseHeaders(response.headers, supportMultiHeaders, supportCookies),
  };
};

const getEncoding = (response: InProcessResponse): Encoding => {
  // APi Gateway REST API cannot handle html responses encoded as base64
  if (response.isUTF8) {
    return 'utf8';
  }
  const contentType = (response.headers['content-type'] as string || '').toLowerCase();
  const isJson = (): boolean => contentType.startsWith('application/json')
  const isText = (): boolean => contentType.startsWith('text/')
  const maybeUtf8 = isJson() || isText()
  if (maybeUtf8 && isUtf8(response.body)) {
    return 'utf8'
  }
  return 'base64'
}

export const errorResponse = (): LambdaResponse => {
  return {
    statusCode: 500,
    multiValueHeaders: {},
    body: '',
    isBase64Encoded: false
  };
}
