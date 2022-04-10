import app from './app';
import lambda from '../src/lambda';


const testEnvironment = () => {
  let __test = 0;
  const _handler = lambda.deferred(() => new Promise(resolve => {
    __test = __test + 1;
    setTimeout(() => {
      resolve(app);
    }, 10);
  }));

  return {
    getValue: () => __test,
    handler: _handler,
  }
}

describe('integration for deferred app', () => {
  it('returns static file', async () => {
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    const t = testEnvironment()
    const response = await t.handler(myEvent)
    expect(response.statusCode).toEqual(200);
    expect(response.isBase64Encoded).toEqual(true);
    expect(response.multiValueHeaders!["content-type"][0]).toEqual('image/png');
    expect(response.multiValueHeaders!["content-length"][0]).toEqual('178');
  });

  it('resolves the app promise only once', async () => {
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    const t = testEnvironment()
    await t.handler(myEvent)
    expect(t.getValue()).toEqual(1);
    await t.handler(myEvent);
    expect(t.getValue()).toEqual(1);
  });

  it('handler returns rejected promise if app cannot be initialized', async () => {
    const failingHandler = lambda.deferred(() => Promise.reject(new Error('failed to initialize app')));
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    try {
      await failingHandler(myEvent)
      fail(new Error('should have failed'))
    } catch (e) {
      const err = e as Error
      expect(err.message).toEqual('failed to initialize app')
    }
  })

  it('returns 500 if there is a problem with the request', async () => {
    const failingApp = lambda.deferred(() => Promise.resolve(() => {throw new Error('failed')}));
    const myEvent = {
      path: "/static/file.png",
      httpMethod: "GET",
      multiValueHeaders: {},
      queryStringParameters: {},
      isBase64Encoded: false,
      body: null
    }
    const res = await failingApp(myEvent)
    expect(res).toEqual({
      body: "",
      isBase64Encoded: false,
      multiValueHeaders: {},
      statusCode: 500,
    })
  })

})
