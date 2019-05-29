import { RequestListener } from 'http';

import { createMockRequest, createMockResponse, MockResponse} from './httpMock';
import { APIGatewayEvent } from './apiGateway';
import eventToRequestOptions from './eventToRequestOptions'
import {mockResponseToApiGatewayResponse, errorResponse} from './response';

const handler = (app: RequestListener) => (event: APIGatewayEvent) => {
  const appHandlerPromise = new Promise<MockResponse>((resolve) => {
    const req = createMockRequest(eventToRequestOptions(event));
    const res = createMockResponse(req);
    res.on('finish', resolve);
    app(req, res);
  });
  return appHandlerPromise
    .then(mockResponseToApiGatewayResponse)
    .catch(e => {
      console.error(e);
      return errorResponse();
    });
}

export = handler;
