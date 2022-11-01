import zlib from "zlib"
import app from "./app"
import lambda from "../src/lambda"

import eventRestApi from "./fixtures/event-rest-api.json"
import eventHttpApi from "./fixtures/event-http-api.json"
import eventHttpApiV1 from "./fixtures/event-http-api-1.0.json"
import eventHttpApiV2 from "./fixtures/event-http-api-2.0.json"
import eventAlb from "./fixtures/alb-event.json"

const handler = lambda(app)

describe("integration", () => {
  it("returns static file", async () => {
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null,
    }
    const response = await handler(myEvent)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(true)
    expect(response.multiValueHeaders!["content-type"][0]).toEqual("image/png")
    expect(response.multiValueHeaders!["content-length"][0]).toEqual("178")
  })

  it("returns set-cookie header as multi-value", async () => {
    const myEvent = {
      path: "/cookies",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null,
    }
    const response = await handler(myEvent)
    expect(response.multiValueHeaders).toEqual(
      expect.objectContaining({
        "set-cookie": [
          "chocolate=10; Path=/",
          "peanut_butter=20; Path=/",
          "cinnamon=30; Path=/",
          "hackyname=h3c%2Fky%3D%3Bva%7Blu%5De; Path=/",
        ],
      })
    )
  })

  it("returns 404 is static file is missing", async () => {
    const myEvent = {
      path: "/static/missing.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null,
    }
    const response = await handler(myEvent)
    expect(response.statusCode).toEqual(404)
    expect(response.isBase64Encoded).toEqual(false)
    expect(response.multiValueHeaders!["content-type"][0]).toEqual(
      "text/html; charset=utf-8"
    )
  })

  it("handles POST requests with body", async () => {
    const myEvent = {
      path: "/reflect",
      httpMethod: "POST",
      headers: { "content-type": "application/json" },
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: JSON.stringify({ hello: "world" }),
    }
    const response = await handler(myEvent)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(false)
    const json = JSON.parse(response.body)
    expect(json.body).toEqual({ hello: "world" })
  })

  it("renders ejs template", async () => {
    const myEvent = {
      path: "/render",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null,
    }
    const response = await handler(myEvent)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(false)
    expect(response.body).toMatch(/^<!DOCTYPE html>/)
    expect(response.multiValueHeaders!["content-type"][0]).toEqual(
      "text/html; charset=utf-8"
    )
    expect(response.multiValueHeaders!["content-length"][0]).toEqual("119")
  })

  it("handles API GW event", async () => {
    const response = await handler(eventRestApi)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(false)
    expect(response.multiValueHeaders!["content-type"][0]).toEqual(
      "application/json; charset=utf-8"
    )
    expect(response.multiValueHeaders!["x-powered-by"][0]).toEqual("Express")
    const json = JSON.parse(response.body)
    expect(json).toEqual({
      baseUrl: "",
      body: {},
      cookies: {
        cookie1: "value1",
        cookie2: "value2",
        cookie3: "value3",
        hackyname: "h3c/ky=;va{lu]e",
      },
      fresh: false,
      hostname: "apiid.execute-api.ap-southeast-2.amazonaws.com",
      ip: "1.152.111.246",
      ips: ["1.152.111.246", "54.239.202.85"],
      method: "GET",
      originalUrl: "/inspect?param=ab+cd",
      params: {},
      path: "/inspect",
      protocol: "https",
      query: {
        param: "ab cd",
      },
      secure: true,
      signedCookies: {},
      stale: true,
      subdomains: ["ap-southeast-2", "execute-api", "apiid"],
      url: "/inspect?param=ab+cd",
      xForwardedFor: "1.152.111.246, 54.239.202.85",
      xhr: false,
    })
  })

  it("handles HTTP API legacy event", async () => {
    const response = await handler(eventHttpApi)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(false)
    expect(response.multiValueHeaders!["content-type"][0]).toEqual(
      "application/json; charset=utf-8"
    )
    expect(response.multiValueHeaders!["x-powered-by"][0]).toEqual("Express")
    expect(response.headers!["content-type"]).toEqual(
      "application/json; charset=utf-8"
    )
    expect(response.headers!["x-powered-by"]).toEqual("Express")
    const json = JSON.parse(response.body)
    expect(json).toEqual({
      baseUrl: "",
      body: {},
      cookies: {
        cookie1: "value1",
        cookie2: "value2",
        cookie3: "value3",
        hackyname: "h3c/ky=;va{lu]e",
      },
      fresh: false,
      hostname: "apiid.execute-api.ap-southeast-2.amazonaws.com",
      ip: "4.5.6.7",
      ips: ["4.5.6.7", "9.9.9.9"],
      method: "GET",
      originalUrl: "/inspect?param=ab+cd",
      params: {},
      path: "/inspect",
      protocol: "https",
      query: {
        param: "ab cd",
      },
      secure: true,
      signedCookies: {},
      stale: true,
      subdomains: ["ap-southeast-2", "execute-api", "apiid"],
      url: "/inspect?param=ab+cd",
      xForwardedFor: "1.2.3.4, 4.5.6.7, 9.9.9.9",
      xhr: false,
    })
  })

  it("handles HTTP API v1.0 event", async () => {
    const response = await handler(eventHttpApiV1)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(false)
    expect(response.multiValueHeaders!["content-type"][0]).toEqual(
      "application/json; charset=utf-8"
    )
    expect(response.multiValueHeaders!["x-powered-by"][0]).toEqual("Express")
    expect(response.headers!["content-type"]).toEqual(
      "application/json; charset=utf-8"
    )
    expect(response.headers!["x-powered-by"]).toEqual("Express")
    const json = JSON.parse(response.body)
    expect(json).toEqual({
      baseUrl: "",
      body: {},
      cookies: {
        cookie1: "value1",
        cookie2: "value2",
        cookie3: "value3",
        hackyname: "h3c/ky=;va{lu]e",
      },
      fresh: false,
      hostname: "apiid.execute-api.ap-southeast-2.amazonaws.com",
      ip: "4.5.6.7",
      ips: ["4.5.6.7", "9.9.9.9"],
      method: "GET",
      originalUrl: "/inspect?param=ab+cd",
      params: {},
      path: "/inspect",
      protocol: "https",
      query: {
        param: "ab cd",
      },
      secure: true,
      signedCookies: {},
      stale: true,
      subdomains: ["ap-southeast-2", "execute-api", "apiid"],
      url: "/inspect?param=ab+cd",
      xForwardedFor: "1.2.3.4, 4.5.6.7, 9.9.9.9",
      xhr: false,
    })
  })

  it("handles HTTP API v2.0 event", async () => {
    const response = await handler(eventHttpApiV2)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(false)
    expect(response.headers!["content-type"]).toEqual(
      "application/json; charset=utf-8"
    )
    expect(response.headers!["x-powered-by"]).toEqual("Express")
    expect(response.multiValueHeaders).toBeUndefined()
    const json = JSON.parse(response.body)
    expect(json).toEqual({
      baseUrl: "",
      body: {},
      cookies: {
        cookie1: "value1",
        cookie2: "value2",
        cookie3: "value3",
        hackyname: "h3c/ky=;va{lu]e",
      },
      fresh: false,
      hostname: "apiid.execute-api.ap-southeast-2.amazonaws.com",
      ip: "4.5.6.7",
      ips: ["4.5.6.7", "9.9.9.9"],
      method: "GET",
      originalUrl: "/inspect?param=ab+cd",
      params: {},
      path: "/inspect",
      protocol: "https",
      query: {
        param: "ab cd",
      },
      secure: true,
      signedCookies: {},
      stale: true,
      subdomains: ["ap-southeast-2", "execute-api", "apiid"],
      url: "/inspect?param=ab+cd",
      xForwardedFor: "1.2.3.4, 4.5.6.7, 9.9.9.9",
      xhr: false,
    })
  })

  it("handles ALB event", async () => {
    const response = await handler(eventAlb)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(false)
    expect(response.headers!["content-type"]).toEqual(
      "application/json; charset=utf-8"
    )
    expect(response.headers!["x-powered-by"]).toEqual("Express")
    const json = JSON.parse(response.body)
    expect(json).toEqual({
      baseUrl: "",
      body: {},
      cookies: {
        cookie1: "value1",
        cookie2: "value2",
        cookie3: "value3",
        hackyname: "h3c/ky=;va{lu]e",
      },
      fresh: false,
      hostname: "elbname-234234234234.ap-southeast-2.elb.amazonaws.com",
      ip: "1.136.104.131",
      ips: [],
      method: "GET",
      originalUrl: "/inspect?param=ab+cd",
      params: {},
      path: "/inspect",
      protocol: "http",
      query: {
        param: "ab cd",
      },
      secure: false,
      signedCookies: {},
      stale: true,
      subdomains: ["elb", "ap-southeast-2", "elbname-234234234234"],
      url: "/inspect?param=ab+cd",
      xhr: false,
    })
  })

  it("handles routing with params", async () => {
    const myEvent = {
      path: "/user/123",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null,
    }
    const response = await handler(myEvent)
    expect(response.statusCode).toEqual(200)
    expect(response.isBase64Encoded).toEqual(false)
    const json = JSON.parse(response.body)
    expect(json).toEqual({ name: "John", id: "123" })
  })

  it("works with compressed response", async () => {
    const myEvent = {
      path: "/static/big.html",
      httpMethod: "GET",
      headers: {
        "Accept-Encoding": "gzip",
      },
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null,
    }

    const gunzip = (body: Buffer): Promise<Buffer> =>
      new Promise((resolve, reject) => {
        zlib.gunzip(body, (error, data) => {
          if (error) {
            return reject(error)
          }
          resolve(data)
        })
      })

    const response = await handler(myEvent)
    expect(response.statusCode).toEqual(200)
    expect(response.multiValueHeaders!["content-encoding"][0]).toEqual("gzip")
    expect(response.multiValueHeaders!["content-type"][0]).toEqual(
      "text/html; charset=UTF-8"
    )
    expect(response.isBase64Encoded).toEqual(true)
    const body = await gunzip(Buffer.from(response.body, "base64"))
    expect(body.toString()).toMatch(/^<!DOCTYPE html>/)
  })

  it("handles url GET params as expected", async () => {
    const myEvent = {
      path: "/inspect",
      httpMethod: "GET",
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: {
        paRaM1: "valuE1",
        param2: "value2",
      },
      isBase64Encoded: false,
      body: null,
    }

    const response = await handler(myEvent)
    expect(response.statusCode).toEqual(200)
    const json = JSON.parse(response.body)
    expect(json.originalUrl).toEqual("/inspect?paRaM1=valuE1&param2=value2")
    expect(json.query).toEqual({
      paRaM1: "valuE1",
      param2: "value2",
    })
  })
})
