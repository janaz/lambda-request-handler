import { InProcessResponse } from 'in-process-request';
import { APIGatewayResponse} from './types';
import fixResponseHeaders from './fixResponseHeaders'

export const inProcessResponseToApiGatewayResponse = (response: InProcessResponse): APIGatewayResponse => {
  const encoding = response.isUTF8 ? 'utf8' : 'base64';
  return {
    statusCode: response.statusCode,
    body: response.body.toString(encoding),
    isBase64Encoded: encoding === 'base64',
    ...fixResponseHeaders(response.headers),
  };
};

export const errorResponse = (): APIGatewayResponse => {
  return {
    statusCode: 500,
    headers: {},
    multiValueHeaders: {},
    body: '',
    isBase64Encoded: false
  };
}
