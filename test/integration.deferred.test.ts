import app from './app';
import lambda from '../src/lambda';

let __test = 0;
const handler = lambda.deferred(() => new Promise(resolve => {
  __test = __test + 1;
  setTimeout(() => {
    resolve(app);
  }, 10);
}));

describe('integration for deferred app', () => {
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

  it('resolves the app promise only once', () => {
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return handler(myEvent)
      .then(() => {
        expect(__test).toEqual(1);
        return handler(myEvent);
      }).then(() => {
        expect(__test).toEqual(1);
      });
  });

  it('handler returns rejected promise if app cannot be initialized', () => {
    const failingHandler = lambda.deferred(() => Promise.reject(new Error('failed to initialize app')));
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return failingHandler(myEvent)
      .then(
        () => Promise.reject(new Error('should have failed')),
        e => {
          expect(e.message).toEqual('failed to initialize app')
      })
  })

  it('returns 500 if there is a problem with the request', () => {
    const failingApp = lambda.deferred(() => Promise.resolve(() => {throw new Error('failed')}));
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return failingApp(myEvent)
      .then((res) => {
        expect(res).toEqual({
          body: "",
          isBase64Encoded: false,
          multiValueHeaders: {},
          statusCode: 500,
        })
      });
  })

})
