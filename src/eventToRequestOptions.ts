import * as url from 'url';

import { InProcessRequestOptions } from 'in-process-request';
import { APIGatewayEvent } from './apiGateway';

const eventToRequestOptions = (event: APIGatewayEvent): InProcessRequestOptions => {
  return {
    method: event.httpMethod,
    path: url.format({ pathname: event.path, query: event.queryStringParameters }),
    headers: event.headers,
    body: Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8'),
    ssl: true,
    remoteAddress: event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp
  };
}
export default eventToRequestOptions;
