import { LambdaResponse } from "./types"
import fixResponseHeaders from "./fixResponseHeaders"
import isUtf8 from "isutf8"
import { Response } from "light-my-request"
import { OutgoingHttpHeaders } from "http"

type Encoding = "base64" | "utf8"
export const inProcessResponseToLambdaResponse = (
  response: Response,
  supportMultiHeaders: boolean,
  supportCookies: boolean
): LambdaResponse => {
  const encoding = getEncoding(response)
  return {
    statusCode: response.statusCode,
    body: response.rawPayload.toString(encoding),
    isBase64Encoded: encoding === "base64",
    ...fixResponseHeaders(
      response.headers,
      supportMultiHeaders,
      supportCookies
    ),
  }
}

const isUTF8 = (headers: OutgoingHttpHeaders): boolean => {
  if (headers["content-encoding"]) {
    return false
  }
  const contentType = (headers["content-type"] as string) || ""
  return contentType.match(/charset=(utf-8|"utf-8")$/i) ? true : false
}
const getEncoding = (response: Response): Encoding => {
  // APi Gateway REST API cannot handle html responses encoded as base64
  if (isUTF8(response.headers)) {
    return "utf8"
  }
  const contentType = (
    (response.headers["content-type"] as string) || ""
  ).toLowerCase()
  const isJson = (): boolean => contentType.startsWith("application/json")
  const isText = (): boolean => contentType.startsWith("text/")
  const maybeUtf8 = isJson() || isText()
  if (maybeUtf8 && isUtf8(response.rawPayload)) {
    return "utf8"
  }
  return "base64"
}

export const errorResponse = (): LambdaResponse => {
  return {
    statusCode: 500,
    multiValueHeaders: {},
    body: "",
    isBase64Encoded: false,
  }
}
