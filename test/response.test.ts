import { inProcessResponseToLambdaResponse, errorResponse} from '../src/response';
import { InProcessResponse } from 'in-process-request';

describe('inProcessResponseToLambdaResponse', () => {
  interface GenerateMockResponseOptions {
    body?: Buffer
    isUTF8?: boolean
    contentType?: string
  }
  const generateMockResponse = (opts: GenerateMockResponseOptions = {}): InProcessResponse => ({
    body: opts.body || Buffer.from('hello'),
    headers: {
      'set-cookie': ['chocolate=10; Path=/', 'peanut_butter=20; Path=/'],
      'content-type': opts.contentType || 'text/plain',
      'x-custom': '10',
    },
    isUTF8: opts.isUTF8 === true,
    statusCode: 200,
    statusMessage: 'OK',
  });

  it('returns 200', () => {
    const res = inProcessResponseToLambdaResponse(generateMockResponse(), true, false);
    expect(res.statusCode).toEqual(200);
  })

  it('has plain text body', () => {
    const res = inProcessResponseToLambdaResponse(generateMockResponse(), true, false);
    expect(res.body).toEqual('hello');
  })

  it('is not base64 encoded', () => {
    const res = inProcessResponseToLambdaResponse(generateMockResponse(), true, false);
    expect(res.isBase64Encoded).toEqual(false);
  })

  describe('cookies and headers', () => {

    it('has multi value headers with cookies', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse(), true, true);
      expect(res.multiValueHeaders).toEqual({
        'content-type': ['text/plain'],
        'x-custom': ['10'],
        'set-cookie': [
          'chocolate=10; Path=/',
          'peanut_butter=20; Path=/',
        ]
      });
    })

    it('has multi value headers without cookies', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse(), true, false);
      expect(res.multiValueHeaders).toEqual({
        'content-type': ['text/plain'],
        'x-custom': ['10'],
        'set-cookie': [
          'chocolate=10; Path=/',
          'peanut_butter=20; Path=/',
        ]
      });
    })

    it('has single value headers when multiValue and cookies are not supported', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse(), false, false);
      expect(res.headers!).toEqual({
        'Set-cookie': 'peanut_butter=20; Path=/',
        'set-cookie': 'chocolate=10; Path=/',
        'content-type': 'text/plain',
        'x-custom': '10',
      });
    })

    it('has no set-cookie headers when multiValue is not supported, but cookies are', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse(), false, true);
      expect(res.headers).toEqual({
        'content-type': 'text/plain',
        'x-custom': '10',
      });
      expect(res.cookies).toEqual([
        'chocolate=10; Path=/',
        'peanut_butter=20; Path=/',
      ])
    })

  })

  describe('when the body is not utf8', () => {
    it('has base64 body', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse({isUTF8: false, contentType: 'not-text/plain'}), true, false);
      expect(res.body).toEqual('aGVsbG8=');
    })

    it('is not base64 encoded', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse({isUTF8: false, contentType: 'not-text/plain'}), true, false);
      expect(res.isBase64Encoded).toEqual(true);
    })

    it('has base64 body if isUTF8 is set to false and content type starts with text/ and the content is not UTF8', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse({body: Buffer.from([1,2,3,4,5,6]), isUTF8: false, contentType: 'binary/octet-stream'}), false, false);
      expect(res.isBase64Encoded).toEqual(true);
      expect(res.body).toEqual('AQIDBAUG');
    })

  })

  describe('UTF8 content', () => {
    it('has utf8 body if isUTF8 is set to true', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse({isUTF8: true, contentType: 'not-text/plain'}), false, false);
      expect(res.isBase64Encoded).toEqual(false);
      expect(res.body).toEqual('hello');
    })

    it('has utf8 body if isUTF8 is set to false but content type starts with text/ and the content is text', () => {
      const res = inProcessResponseToLambdaResponse(generateMockResponse({body: Buffer.from('text'), isUTF8: false, contentType: 'text/plain'}), false, false);
      expect(res.isBase64Encoded).toEqual(false);
      expect(res.body).toEqual('text');
    })
  })

})

describe('errorResponse', () => {
  it('returns 500', () => {
    expect(errorResponse().statusCode).toEqual(500);
  })
  it('has no headers', () => {
    expect(errorResponse().multiValueHeaders).toEqual({});
  })
  it('has no body', () => {
    expect(errorResponse().body).toEqual('');
  })
  it('is not base64 encoded', () => {
    expect(errorResponse().isBase64Encoded).toEqual(false);
  })
})
