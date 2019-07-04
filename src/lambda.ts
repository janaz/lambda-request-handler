import { RequestListener } from 'http';
import inProcessRequestHandler from 'in-process-request';
import * as apigw from './types';
import eventToRequestOptions from './eventToRequestOptions'
import { inProcessResponseToApiGatewayResponse, errorResponse } from './response';

declare namespace handler {
  type APIGatewayEvent = apigw.APIGatewayEvent;
  type APIGatewayResponse = apigw.APIGatewayResponse;
  type APIGatewayEventHandler = (event: handler.APIGatewayEvent) => Promise<handler.APIGatewayResponse>
};

const handlerPromise = (appPromiseFn: () => Promise<RequestListener>): handler.APIGatewayEventHandler => {
  let _p: Promise<RequestListener> | null = null;
  return event => {
    if (!_p) {
      _p = appPromiseFn();
    }
    return _p
      .then(app => {
        const reqOptions = eventToRequestOptions(event);
        const appHandler = inProcessRequestHandler(app);
        return appHandler(reqOptions);
      })
      .then(inProcessResponseToApiGatewayResponse)
      .catch(e => {
        console.error(e);
        return errorResponse();
      });
    }
}

const handler = (app: RequestListener): handler.APIGatewayEventHandler => handlerPromise(() => Promise.resolve(app));

handler.deferred = handlerPromise;

export = handler;
