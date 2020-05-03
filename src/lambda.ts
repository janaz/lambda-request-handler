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

type F<A, B> = (a: A) => B;
type Nullable<T> = T | null;
type PromiseFactory<A> = () => Promise<A>;

const eventHasMultiValueHeaders = (event: handler.APIGatewayEvent): boolean => {
  return event.multiValueHeaders !== null && typeof event.multiValueHeaders === 'object';
}

const eventSupportsCookies = (event: handler.APIGatewayEvent): boolean => {
  return event.version === "2.0" && !eventHasMultiValueHeaders(event)
}

const handlerBuilder = (appFn: PromiseFactory<RequestListener>): handler.APIGatewayEventHandler => {
  let appHandler: Nullable<F<MockRequestOptions, Promise<MockResponse>>>;
  return async (event, ctx) => {
    if (!appHandler) {
      const resolvedApp = await appFn();
      appHandler = inProcessRequestHandler(resolvedApp);
    }
    try {
      const reqOptions = eventToRequestOptions(event, ctx);
      const mockResponse = await appHandler(reqOptions);
      return inProcessResponseToLambdaResponse(mockResponse, eventHasMultiValueHeaders(event), eventSupportsCookies(event));
    } catch (e) {
      console.error(e);
      return errorResponse();
    }
  }
};

const handler = (app: RequestListener) => handlerBuilder(() => Promise.resolve(app));
handler.deferred = handlerBuilder;
handler.HapiListener = inProcessRequestHandler.HapiListener;

export = handler;
