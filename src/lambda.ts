import { RequestListener } from "http"
import { HapiListener } from "./handlers/hapiListener"
import * as apigw from "./types"
import eventToRequestOptions from "./eventToRequestOptions"
import { inProcessResponseToLambdaResponse, errorResponse } from "./response"
import { inject } from "light-my-request"
import getNestHandler from "./handlers/nestHandler"
import fastifyHandler from "./handlers/fastifyHandler"
import fastifyV4Handler from "./handlers/fastifyV4Handler"

declare namespace handler {
  type APIGatewayEvent = apigw.APIGatewayEvent
  type APIGatewayResponse = apigw.LambdaResponse
  type LambdaResponse = apigw.LambdaResponse
  type LambdaContext = apigw.LambdaContext
  type APIGatewayEventHandler = (
    event: handler.APIGatewayEvent,
    context?: handler.LambdaContext
  ) => Promise<handler.LambdaResponse>
}

type Nullable<T> = T | null
type PromiseFactory<A> = () => Promise<A>

const eventHasMultiValueHeaders = (event: handler.APIGatewayEvent): boolean => {
  return (
    event.multiValueHeaders !== null &&
    typeof event.multiValueHeaders === "object"
  )
}

const eventSupportsCookies = (event: handler.APIGatewayEvent): boolean => {
  return event.version === "2.0" && !eventHasMultiValueHeaders(event)
}

interface Options {
  beforeDispatch?: (r: apigw.APIGatewayEvent) => Promise<apigw.APIGatewayEvent>
  beforeReturn?: (r: apigw.LambdaResponse) => Promise<apigw.LambdaResponse>
  onError?: (e: Error) => Promise<void>
}

const handlerBuilder = (
  appFn: PromiseFactory<RequestListener>,
  options?: Options
): handler.APIGatewayEventHandler => {
  let dispatch: Nullable<RequestListener>
  return async (event, ctx) => {
    if (!dispatch) {
      dispatch = await appFn()
    }
    try {
      let theEvent = event
      if (options?.beforeDispatch) {
        theEvent = await options.beforeDispatch(theEvent)
      }
      const reqOptions = eventToRequestOptions(theEvent, ctx)
      const mockResponse = await inject(dispatch, reqOptions)
      let response = inProcessResponseToLambdaResponse(
        mockResponse,
        eventHasMultiValueHeaders(event),
        eventSupportsCookies(event)
      )
      if (options?.beforeReturn) {
        response = await options.beforeReturn(response)
      }
      return response
    } catch (e) {
      if (options?.onError) {
        try {
          await options.onError(e as Error)
        } catch (e2) {
          console.error(e)
        }
      } else {
        console.error(e)
      }
      return errorResponse()
    }
  }
}

const handler = (app: RequestListener, options?: Options) =>
  handlerBuilder(() => Promise.resolve(app), options)
handler.deferred = handlerBuilder
handler.HapiListener = HapiListener
handler.nestHandler = getNestHandler
handler.fastifyHandler = fastifyHandler
handler.fastifyV4Handler = fastifyV4Handler

export = handler
