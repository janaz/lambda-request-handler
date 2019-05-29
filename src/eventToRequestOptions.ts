import * as url from 'url';

import { MockRequestOptions} from './httpMock';
import { APIGatewayEvent} from './apiGateway';

const eventToRequestOptions = (event: APIGatewayEvent): MockRequestOptions => {
  return {
    method: event.httpMethod,
    path: url.format({ pathname: event.path, query: event.queryStringParameters }),
    headers: event.headers,
    body: Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8'),
    remoteAddress: event.requestContext.identity ? event.requestContext.identity.sourceIp : undefined
  };
}
export default eventToRequestOptions;
