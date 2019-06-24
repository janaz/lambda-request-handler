import { RequestListener } from 'http';

import inProcessRequestHandler from 'in-process-request';
import { APIGatewayEvent } from './apiGateway';
import eventToRequestOptions from './eventToRequestOptions'
import { inProcessResponseToApiGatewayResponse, errorResponse } from './response';

const handler = (app: RequestListener) => {
  const appHandler = inProcessRequestHandler(app);
  return (event: APIGatewayEvent) => {
    const reqOptions = eventToRequestOptions(event);
    return appHandler(reqOptions)
      .then(inProcessResponseToApiGatewayResponse)
      .catch(e => {
        console.error(e);
        return errorResponse();
      });
  }
};

export = handler;
