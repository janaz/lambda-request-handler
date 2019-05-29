import { mockResponseToApiGatewayResponse, errorResponse} from '../src/response';
import { MockResponse } from '../src/httpMock';


describe('mockResponseToApiGatewayResponse', () => {
  const generateMockResponse = (isUTF8: boolean = true): MockResponse => ({
    body: Buffer.from('hello'),
    headers: {
      'content-type': 'text/plain',
      'x-custom': '10',
    },
    isUTF8,
    statusCode: 200,
  });

  it('returns 200', () => {
    const res = mockResponseToApiGatewayResponse(generateMockResponse());
    expect(res.statusCode).toEqual(200);
  })

  it('has plain text body', () => {
    const res = mockResponseToApiGatewayResponse(generateMockResponse());
    expect(res.body).toEqual('hello');
  })

  it('is not base64 encoded', () => {
    const res = mockResponseToApiGatewayResponse(generateMockResponse());
    expect(res.isBase64Encoded).toEqual(false);
  })

  it('has headers', () => {
    const res = mockResponseToApiGatewayResponse(generateMockResponse());
    expect(res.headers).toEqual({
      'content-type': 'text/plain',
      'x-custom': '10',
    });
  })

  describe('when the body is not utf8', () => {
    it('has base64 body', () => {
      const res = mockResponseToApiGatewayResponse(generateMockResponse(false));
      expect(res.body).toEqual('aGVsbG8=');
    })

    it('is not base64 encoded', () => {
      const res = mockResponseToApiGatewayResponse(generateMockResponse(false));
      expect(res.isBase64Encoded).toEqual(true);
    })


  })
})

describe('errorResponse', () => {
  it('returns 500', () => {
    expect(errorResponse().statusCode).toEqual(500);
  })
  it('has no headers', () => {
    expect(errorResponse().headers).toEqual({});
  })
  it('has no body', () => {
    expect(errorResponse().body).toEqual('');
  })
  it('is not base64 encoded', () => {
    expect(errorResponse().isBase64Encoded).toEqual(false);
  })
})
