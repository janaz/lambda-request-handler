import eventToRequestOptions from '../src/eventToRequestOptions';

import eventRestApi from './fixtures/event-rest-api.json';
import eventHealth from './fixtures/health-event.json';
import eventAlb from './fixtures/alb-event.json';
import evenMultiHeadertAlb from './fixtures/alb-multi-header-event.json';

describe('eventToRequestOptions', () => {
  it('converts Api Gateway event to RequestOptions object', () => {
    const reqOpts = eventToRequestOptions(eventRestApi);
    expect(reqOpts).toEqual({
      "method": "GET",
      "path": "/inspect?param=ab%20cd",
      "remoteAddress": "1.152.111.246",
      "body": Buffer.alloc(0),
      "ssl": true,
      "headers":  {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        "cloudfront-forwarded-proto": "https",
        "cloudfront-is-desktop-viewer": "true",
        "cloudfront-is-mobile-viewer": "false",
        "cloudfront-is-smarttv-viewer": "false",
        "cloudfront-is-tablet-viewer": "false",
        "cloudfront-viewer-country": "AU",
        "cookie": "cookie1=value1; cookie2=value2; cookie3=value3; hackyname=h3c%2Fky%3D%3Bva%7Blu%5De",
        "host": "apiid.execute-api.ap-southeast-2.amazonaws.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
        "via": "2.0 6e1c2492999626e81fa810e92ced9820.cloudfront.net (CloudFront)",
        "x-amz-cf-id": "j3GdPs-yyyEN6QS5_2q8exw-bmECfwKBw-9j3bJ3u1A69j1OlZZAJA==",
        "x-amzn-trace-id": "Root=1-5d2093d3-80c981c4f1d40448d2cb9c28",
        "x-forwarded-for": "1.152.111.246, 54.239.202.85",
        "x-forwarded-port": "443",
        "x-forwarded-proto": "https",
        "accept-encoding": "gzip, deflate, br",
        "upgrade-insecure-requests": "1",
      },
    })
  })

  it('converts ALB single header value event to RequestOptions object', () => {
    const reqOpts = eventToRequestOptions(eventAlb);
    expect(reqOpts).toEqual({
      "method": "GET",
      "path": "/inspect?param=ab%20cd",
      "remoteAddress": "1.136.104.131",
      "body": Buffer.alloc(0),
      "ssl": false,
      "headers":  {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        "cookie": "cookie3=value3; cookie2=value2; cookie1=value1; hackyname=h3c%2Fky%3D%3Bva%7Blu%5De",
        "connection": "keep-alive",
        "host": "elbname-234234234234.ap-southeast-2.elb.amazonaws.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
        "x-amzn-trace-id": "Root=1-5d208beb-7e237639e7d36c48e22f58c7",
        "accept-encoding": "gzip, deflate",
        "upgrade-insecure-requests": "1",
      },
    })
  })

  it('converts ALB multi header value event to RequestOptions object', () => {
    const reqOpts = eventToRequestOptions(evenMultiHeadertAlb);
    expect(reqOpts).toEqual({
      "method": "GET",
      "path": "/inspect?param=ab%20cd",
      "remoteAddress": "1.136.104.131",
      "body": Buffer.alloc(0),
      "ssl": false,
      "headers":  {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        "cookie": "cookie3=value3; cookie2=value2; cookie1=value1",
        "connection": "keep-alive",
        "host": "elbname-234234234234.ap-southeast-2.elb.amazonaws.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
        "x-amzn-trace-id": "Root=1-5d208c21-1820f2f8ce32a27da63181ae",
        "accept-encoding": "gzip, deflate",
        "upgrade-insecure-requests": "1",
      },
    })
  })

  it('sets x-aws-lambda-request-id header with context request id', () => {
    const reqOpts =  eventToRequestOptions(eventRestApi, {awsRequestId: 'req-id'});
    expect(reqOpts.headers!['x-aws-lambda-request-id']).toEqual('req-id');
  });

  describe('ALB', () => {
    it('sets remote ip address based on x-forwarded headers', () => {
      const reqOpts = eventToRequestOptions({
        path: '/',
        httpMethod: 'HEAD',
        body: null,
        headers: {
          "x-forwarded-for": "10.10.2.3, 129.45.45.48",
          "x-forwarded-proto": "http",
        },
        queryStringParameters: {},
        isBase64Encoded: false,
        requestContext: {
          elb: {
            targetGroupArn: 'arn'
          }
        }
      });
      expect(reqOpts).toEqual({
        "method": "HEAD",
        "path": "/",
        "remoteAddress": '129.45.45.48',
        "body": Buffer.alloc(0),
        "ssl": false,
        "headers":  {
          "x-forwarded-for": "10.10.2.3",
          "x-forwarded-proto": "http",
        },
      })
    })

    it('removes x-forwarded headers if there is just one ip in the chain', () => {
      const reqOpts = eventToRequestOptions({
        path: '/',
        httpMethod: 'HEAD',
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
            targetGroupArn: 'arn'
          }
        }
      });

      expect(reqOpts).toEqual({
        "method": "HEAD",
        "path": "/",
        "remoteAddress": '129.45.45.48',
        "body": Buffer.alloc(0),
        "ssl": true,
        "headers":  {
        },
      })
    });

    it('converts ELB health check event to RequestOptions object', () => {
      const reqOpts = eventToRequestOptions(eventHealth);
      expect(reqOpts).toEqual({
        "method": "HEAD",
        "path": "/",
        "remoteAddress": undefined,
        "body": Buffer.alloc(0),
        "ssl": false,
        "headers":  {
          "user-agent": "ELB-HealthChecker/2.0",
        },
      })
    })
  })

})
