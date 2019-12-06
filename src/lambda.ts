import { RequestListener } from 'http';
import inProcessRequestHandler from 'in-process-request';
import * as apigw from './types';
import eventToRequestOptions from './eventToRequestOptions'
import { inProcessResponseToLambdaResponse, errorResponse } from './response';
import { MockRequestOptions, MockResponse } from 'in-process-request/dist/compile/httpMock';

declare namespace handler {
  type APIGatewayEvent = apigw.APIGatewayEvent;
  type APIGatewayResponse = apigw.LambdaResponse;
  type LambdaResponse = apigw.LambdaResponse;
  type LambdaContext = apigw.LambdaContext;
  type APIGatewayEventHandler = (event: handler.APIGatewayEvent, context?: handler.LambdaContext) => Promise<handler.LambdaResponse>
};

const eventHasMultiValueHeaders = (event: handler.APIGatewayEvent): boolean => {
  return event.multiValueHeaders !== null && typeof event.multiValueHeaders === 'object';
}

const processRequest = (app: Promise<RequestListener>): handler.APIGatewayEventHandler => {
  let appHandler: ((r: MockRequestOptions) => Promise<MockResponse>) | null = null;
  return async (event, ctx) => {
    if (!appHandler) {
      const resolvedApp = await app;
      appHandler = inProcessRequestHandler(resolvedApp);
    }
    try {
      const reqOptions = eventToRequestOptions(event, ctx);
      const mockResponse = await appHandler(reqOptions);
      return inProcessResponseToLambdaResponse(mockResponse, eventHasMultiValueHeaders(event));
    } catch (e) {
      console.error(e);
      return errorResponse();
    }
  }
};

const handlerPromise = (appPromiseFn: () => Promise<RequestListener>): handler.APIGatewayEventHandler => processRequest(appPromiseFn());

const handler = (app: RequestListener): handler.APIGatewayEventHandler => processRequest(Promise.resolve(app));

handler.deferred = handlerPromise;

export = handler;
