import { RequestListener } from 'http';

import mockRequestHandler from './request-handler/handler';
import { APIGatewayEvent } from './apiGateway';
import eventToRequestOptions from './eventToRequestOptions'
import {mockResponseToApiGatewayResponse, errorResponse} from './response';


const handler = (app: RequestListener) => {
  const appHandler = mockRequestHandler(app);
  return (event: APIGatewayEvent) => {
    const reqOptions = eventToRequestOptions(event);
    return appHandler(reqOptions)
    .then(mockResponseToApiGatewayResponse)
    .catch(e => {
      console.error(e);
      return errorResponse();
    });
  }
};

export = handler;
