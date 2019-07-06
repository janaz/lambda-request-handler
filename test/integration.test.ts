import zlib from 'zlib';
import app from './app';
import lambda from '../src/lambda';

import event from './fixtures/event.json';
import eventAlb from './fixtures/alb-event.json';

const handler = lambda(app);

describe('integration', () => {
  it('returns static file', () => {
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return handler(myEvent).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(true);
      expect(response.multiValueHeaders!["content-type"][0]).toEqual('image/png');
      expect(response.multiValueHeaders!["content-length"][0]).toEqual('178');
    });
  });

  it('returns set-cookie header as multi-value', () => {
    const myEvent = {
      path: "/cookies",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return handler(myEvent).then(response => {
      expect(response.multiValueHeaders).toEqual(expect.objectContaining({
        'set-cookie': [
          'chocolate=10; Path=/',
          'peanut_butter=20; Path=/',
          'cinnamon=30; Path=/',
        ]
      }));
    });
  });

  it('returns 404 is static file is missing', () => {
    const myEvent = {
      path: "/static/missing.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return handler(myEvent).then(response => {
      expect(response.statusCode).toEqual(404);
      expect(response.isBase64Encoded).toEqual(false);
      expect(response.multiValueHeaders!["content-type"][0]).toEqual('text/html; charset=utf-8');
    });
  });

  it('handles POST requests with body', () => {
    const myEvent = {
      path: "/reflect",
      httpMethod: "POST",
      headers: {'content-type': 'application/json'},
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: JSON.stringify({hello: 'world'})
    }
    return handler(myEvent).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(false);
      const json = JSON.parse(response.body);
      expect(json.body).toEqual({hello: 'world'})
    });
  });

  it('renders ejs template', () => {
    const myEvent = {
      path: "/render",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return handler(myEvent).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(false);
      expect(response.body).toMatch(/^<!DOCTYPE html>/);
      expect(response.multiValueHeaders!["content-type"][0]).toEqual('text/html; charset=utf-8');
      expect(response.multiValueHeaders!["content-length"][0]).toEqual('119');
    });
  });

  it('handles API GW event', () => {
    return handler(event).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(false);
      expect(response.multiValueHeaders!["content-type"][0]).toEqual('application/json; charset=utf-8');
      expect(response.multiValueHeaders!["x-powered-by"][0]).toEqual('Express');
      const json = JSON.parse(response.body);
      expect(json).toEqual({
        baseUrl: "",
        body: {},
        cookies: {
          cookie1: "value1",
          cookie2: "value2",
          cookie3: "value3",        },
        fresh: false,
        hostname: "apiid.execute-api.ap-southeast-2.amazonaws.com",
        ip: "1.152.111.246",
        ips: [],
        method: "GET",
        originalUrl: "/inspect?param=ab%20cd",
        params: {},
        path: "/inspect",
        protocol: "https",
        query: {
          param: "ab cd",
        },
        secure: true,
        signedCookies: {},
        stale: true,
        subdomains: [
          "ap-southeast-2",
          "execute-api",
          "apiid",
        ],
        url: "/inspect?param=ab%20cd",
        xForwardedFor: "1.152.111.246, 54.239.202.85",
        xhr: false,
      })
    })
  })

  it('handles ALB event', () => {
    return handler(eventAlb).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(false);
      expect(response.headers!["content-type"]).toEqual('application/json; charset=utf-8');
      expect(response.headers!["x-powered-by"]).toEqual('Express');
      const json = JSON.parse(response.body);
      expect(json).toEqual({
        baseUrl: "",
        body: {},
        cookies: {
          cookie1: "value1",
          cookie2: "value2",
          cookie3: "value3",        },
        fresh: false,
        hostname: "elbname-234234234234.ap-southeast-2.elb.amazonaws.com",
        ip: "1.136.104.131",
        ips: [],
        method: "GET",
        originalUrl: "/inspect?param=ab%20cd",
        params: {},
        path: "/inspect",
        protocol: "http",
        query: {
          param: "ab cd",
        },
        secure: false,
        signedCookies: {},
        stale: true,
        subdomains: [
          "elb",
          "ap-southeast-2",
          "elbname-234234234234",
        ],
        url: "/inspect?param=ab%20cd",
        xhr: false,
      })
    })
  })

  it('handles routing with params', () => {
    const myEvent = {
      path: "/user/123",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return handler(myEvent).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(false);
      const json = JSON.parse(response.body);
      expect(json).toEqual({name: 'John', id: '123'})
    });
  });

  it('works with compressed response', () => {
    const myEvent = {
      path: "/static/big.html",
      httpMethod: "GET",
      headers: {
        'Accept-Encoding': 'gzip'
      },
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }

    const gunzip = (body: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
      zlib.gunzip(body, (error, data) => {
        if(error) {
          return reject(error);
        }
        resolve(data);
      });
    });

    return handler(myEvent).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.multiValueHeaders!['content-encoding'][0]).toEqual('gzip');
      expect(response.multiValueHeaders!['content-type'][0]).toEqual('text/html; charset=UTF-8');
      expect(response.isBase64Encoded).toEqual(true);
      return gunzip(Buffer.from(response.body, 'base64'));
    })
    .then(body => {
      expect(body.toString()).toMatch(/^<!DOCTYPE html>/);
    });
  });

})
