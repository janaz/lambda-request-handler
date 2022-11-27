import eventToRequestOptions from "../src/eventToRequestOptions"

import eventRestApi from "./fixtures/event-rest-api.json"
import eventHttpApiV1 from "./fixtures/event-http-api-1.0.json"
import eventHttpApiV2 from "./fixtures/event-http-api-2.0.json"
import eventHttpApiLegacy from "./fixtures/event-http-api.json"
import eventHealth from "./fixtures/health-event.json"
import eventAlb from "./fixtures/alb-event.json"
import eventLambdaUrl from "./fixtures/event-lambda-url.json"
import evenMultiHeadertAlb from "./fixtures/alb-multi-header-event.json"

describe("eventToRequestOptions", () => {
  it("converts Api Gateway event to RequestOptions object", () => {
    const reqOpts = eventToRequestOptions(eventRestApi)
    expect(reqOpts).toEqual({
      method: "GET",
      path: {
        pathname: "/inspect",
        protocol: "https",
        query: { param: "ab cd" },
      },
      remoteAddress: "1.152.111.246",
      payload: Buffer.alloc(0),
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        "cloudfront-forwarded-proto": "https",
        "cloudfront-is-desktop-viewer": "true",
        "cloudfront-is-mobile-viewer": "false",
        "cloudfront-is-smarttv-viewer": "false",
        "cloudfront-is-tablet-viewer": "false",
        "cloudfront-viewer-country": "AU",
        cookie:
          "cookie1=value1; cookie2=value2; cookie3=value3; hackyname=h3c%2Fky%3D%3Bva%7Blu%5De",
        host: "apiid.execute-api.ap-southeast-2.amazonaws.com",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
        via: "2.0 6e1c2492999626e81fa810e92ced9820.cloudfront.net (CloudFront)",
        "x-amz-cf-id":
          "j3GdPs-yyyEN6QS5_2q8exw-bmECfwKBw-9j3bJ3u1A69j1OlZZAJA==",
        "x-amzn-trace-id": "Root=1-5d2093d3-80c981c4f1d40448d2cb9c28",
        "x-forwarded-for": "1.152.111.246, 54.239.202.85",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https",
        "accept-encoding": "gzip, deflate, br",
        "upgrade-insecure-requests": "1",
      },
    })
  })

  it("converts Api Gateway HTTP v1 event to RequestOptions object", () => {
    const reqOpts = eventToRequestOptions(eventHttpApiV1)
    expect(reqOpts).toEqual({
      method: "GET",
      path: {
        pathname: "/inspect",
        protocol: "https",
        query: { param: "ab cd" },
      },
      remoteAddress: "9.9.9.9",
      payload: Buffer.alloc(0),
      headers: {
        "content-length": "0",
        host: "apiid.execute-api.ap-southeast-2.amazonaws.com",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36",
        "x-amzn-trace-id": "Root=1-5eac36bd-7a4863e4e05a7ca67c0a68ae",
        "x-forwarded-for": "1.2.3.4, 4.5.6.7, 9.9.9.9",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie:
          "cookie1=value1; cookie2=value2; cookie3=value3; hackyname=h3c%2Fky%3D%3Bva%7Blu%5De",
      },
    })
  })

  it("converts Api Gateway HTTP v2 event to RequestOptions object", () => {
    const reqOpts = eventToRequestOptions(eventHttpApiV2)
    expect(reqOpts).toEqual({
      method: "GET",
      path: {
        pathname: "/inspect",
        protocol: "https",
        query: { param: "ab cd" },
      },
      remoteAddress: "9.9.9.9",
      payload: Buffer.alloc(0),
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        "cache-control": "max-age=0",
        "content-length": "0",
        cookie:
          "cookie1=value1; cookie2=value2; cookie3=value3; hackyname=h3c%2Fky%3D%3Bva%7Blu%5De",
        host: "apiid.execute-api.ap-southeast-2.amazonaws.com",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36",
        "x-amzn-trace-id": "Root=1-5eac37e3-8e447320ce745898566b3300",
        "x-forwarded-for": "1.2.3.4, 4.5.6.7, 9.9.9.9",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https",
      },
    })
  })

  it("converts Lambda Url event to RequestOptions object", () => {
    const reqOpts = eventToRequestOptions(eventLambdaUrl)
    expect(reqOpts).toEqual({
      method: "GET",
      path: {
        pathname: "/inspect",
        protocol: "https",
        query: { param: "ab cd" },
      },
      remoteAddress: "9.9.9.9",
      payload: Buffer.alloc(0),
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language":
          "en-AU,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,en-GB;q=0.6,en-US;q=0.5",
        "cache-control": "no-cache",
        cookie: "cookie1=value1",
        host: "uh7wqgxfah6pv7xm35xyjmev3e0tifwv.lambda-url.ap-southeast-2.on.aws",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "x-amzn-tls-cipher-suite": "ECDHE-RSA-AES128-GCM-SHA256",
        "x-amzn-tls-version": "TLSv1.2",
        "x-amzn-trace-id": "Root=1-63833daf-2b68425f0431c7477a997202",
        "x-forwarded-for": "9.9.9.9",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https",
      },
    })
  })

  it("converts Api Gateway HTTP legacy event to RequestOptions object", () => {
    const reqOpts = eventToRequestOptions(eventHttpApiLegacy)
    expect(reqOpts).toEqual({
      method: "GET",
      path: {
        pathname: "/inspect",
        protocol: "https",
        query: { param: "ab cd" },
      },
      remoteAddress: "9.9.9.9",
      payload: Buffer.alloc(0),
      headers: {
        "content-length": "0",
        host: "apiid.execute-api.ap-southeast-2.amazonaws.com",
        "user-agent": "curl/7.54.0",
        "x-amzn-trace-id": "Root=1-5de881d0-2a206d74d6702f28f7e78eb0",
        "x-forwarded-for": "1.2.3.4, 4.5.6.7, 9.9.9.9",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https",
        accept: "*/*",
        cookie:
          "cookie1=value1; cookie2=value2; cookie3=value3; hackyname=h3c%2Fky%3D%3Bva%7Blu%5De",
      },
    })
  })

  it("converts ALB single header value event to RequestOptions object", () => {
    const reqOpts = eventToRequestOptions(eventAlb)
    expect(reqOpts).toEqual({
      method: "GET",
      path: {
        pathname: "/inspect",
        protocol: "http",
        query: { param: "ab cd" },
      },
      remoteAddress: "1.136.104.131",
      payload: Buffer.alloc(0),
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        cookie:
          "cookie3=value3; cookie2=value2; cookie1=value1; hackyname=h3c%2Fky%3D%3Bva%7Blu%5De",
        connection: "keep-alive",
        host: "elbname-234234234234.ap-southeast-2.elb.amazonaws.com",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
        "x-amzn-trace-id": "Root=1-5d208beb-7e237639e7d36c48e22f58c7",
        "accept-encoding": "gzip, deflate",
        "upgrade-insecure-requests": "1",
      },
    })
  })

  it("converts ALB multi header value event to RequestOptions object", () => {
    const reqOpts = eventToRequestOptions(evenMultiHeadertAlb)
    expect(reqOpts).toEqual({
      method: "GET",
      path: {
        pathname: "/inspect",
        protocol: "http",
        query: {
          param: "ab cd",
        },
      },
      remoteAddress: "1.136.104.131",
      payload: Buffer.alloc(0),
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        cookie: "cookie3=value3; cookie2=value2; cookie1=value1",
        connection: "keep-alive",
        host: "elbname-234234234234.ap-southeast-2.elb.amazonaws.com",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
        "x-amzn-trace-id": "Root=1-5d208c21-1820f2f8ce32a27da63181ae",
        "accept-encoding": "gzip, deflate",
        "upgrade-insecure-requests": "1",
      },
    })
  })

  it("sets x-aws-lambda-request-id header with context request id", () => {
    const reqOpts = eventToRequestOptions(eventRestApi, {
      awsRequestId: "req-id",
    })
    expect(reqOpts.headers!["x-aws-lambda-request-id"]).toEqual("req-id")
  })

  describe("ALB", () => {
    it("sets remote ip address based on x-forwarded headers", () => {
      const reqOpts = eventToRequestOptions({
        path: "/",
        httpMethod: "HEAD",
        body: null,
        headers: {
          "x-forwarded-for": "10.10.2.3, 129.45.45.48",
          "x-forwarded-proto": "http",
        },
        queryStringParameters: {},
        isBase64Encoded: false,
        requestContext: {
          elb: {
            targetGroupArn: "arn",
          },
        },
      })
      expect(reqOpts).toEqual({
        method: "HEAD",
        path: {
          pathname: "/",
          protocol: "http",
          query: {},
        },
        remoteAddress: "129.45.45.48",
        payload: Buffer.alloc(0),
        headers: {
          "x-forwarded-for": "10.10.2.3",
          "x-forwarded-proto": "http",
        },
      })
    })

    it("removes x-forwarded headers if there is just one ip in the chain", () => {
      const reqOpts = eventToRequestOptions({
        path: "/",
        httpMethod: "HEAD",
        body: null,
        headers: {
          "x-forwarded-for": "129.45.45.48",
          "x-forwarded-proto": "https",
          "x-forwarded-port": "443",
        },
        queryStringParameters: {},
        isBase64Encoded: true,
        requestContext: {
          elb: {
            targetGroupArn: "arn",
          },
        },
      })

      expect(reqOpts).toEqual({
        method: "HEAD",
        path: {
          pathname: "/",
          protocol: "https",
          query: {},
        },
        remoteAddress: "129.45.45.48",
        payload: Buffer.alloc(0),
        headers: {},
      })
    })

    it("converts ELB health check event to RequestOptions object", () => {
      const reqOpts = eventToRequestOptions(eventHealth)
      expect(reqOpts).toEqual({
        method: "HEAD",
        path: {
          pathname: "/",
          protocol: "http",
          query: {},
        },
        remoteAddress: undefined,
        payload: Buffer.alloc(0),
        headers: {
          "user-agent": "ELB-HealthChecker/2.0",
        },
      })
    })
  })
})
