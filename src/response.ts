import { MockResponse} from './request-handler/httpMock';
import { APIGatewayResponse} from './apiGateway';
import fixResponseHeaders from './fixResponseHeaders'

export const mockResponseToApiGatewayResponse = (response: MockResponse): APIGatewayResponse => {
  return {
    statusCode: response.statusCode,
    headers: fixResponseHeaders(response.headers),
    body: response.body.toString(response.isUTF8 ? 'utf8' : 'base64'),
    isBase64Encoded: !response.isUTF8
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
