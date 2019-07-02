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
      headers: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    return handler(myEvent).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(true);
      expect(response.headers["content-type"]).toEqual('image/png');
      expect(response.headers["content-length"]).toEqual('178');
    });
  });

  it('resolves the app promise only once', () => {
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      headers: {},
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
})
