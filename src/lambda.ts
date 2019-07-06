import { RequestListener } from 'http';
import inProcessRequestHandler from 'in-process-request';
import * as apigw from './types';
import eventToRequestOptions from './eventToRequestOptions'
import { inProcessResponseToLambdaResponse, errorResponse } from './response';

declare namespace handler {
  type APIGatewayEvent = apigw.APIGatewayEvent;
  type APIGatewayResponse = apigw.LambdaResponse;
  type LambdaResponse = apigw.LambdaResponse;
  type LambdaContext = apigw.LambdaContext;
  type APIGatewayEventHandler = (event: handler.APIGatewayEvent, context?: handler.LambdaContext) => Promise<handler.LambdaResponse>
};

const eventWithMultiValueHeaders = (event: handler.APIGatewayEvent): boolean => {
  return event.multiValueHeaders !== null && typeof event.multiValueHeaders === 'object';
}

const handlerPromise = (appPromiseFn: () => Promise<RequestListener>): handler.APIGatewayEventHandler => {
  let _p: Promise<RequestListener> | null = null;
  return (event, ctx) => {
    if (!_p) {
      _p = appPromiseFn();
    }
    return _p
      .then(app => {
        return Promise.resolve()
          .then(() => {
            const reqOptions = eventToRequestOptions(event, ctx);
            const appHandler = inProcessRequestHandler(app);
            return appHandler(reqOptions)
          })
          .then(res => inProcessResponseToLambdaResponse(res, eventWithMultiValueHeaders(event)))
          .catch(e => {
            console.error(e);
            return errorResponse();
          });
      })
    }
}

const handler = (app: RequestListener): handler.APIGatewayEventHandler => handlerPromise(() => Promise.resolve(app));

handler.deferred = handlerPromise;

export = handler;
