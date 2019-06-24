import { InProcessResponse } from 'in-process-request';
import { APIGatewayResponse} from './apiGateway';
import fixResponseHeaders from './fixResponseHeaders'

export const inProcessResponseToApiGatewayResponse = (response: InProcessResponse): APIGatewayResponse => {
  const encoding = response.isUTF8 ? 'utf8' : 'base64';
  return {
    statusCode: response.statusCode,
    headers: fixResponseHeaders(response.headers),
    body: response.body.toString(encoding),
    isBase64Encoded: encoding === 'base64'
  };
};

export const errorResponse = (): APIGatewayResponse => {
  return {
    statusCode: 500,
    headers: {},
    body: '',
    isBase64Encoded: false
  };
}
