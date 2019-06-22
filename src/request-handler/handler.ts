import { RequestListener} from 'http';

import { MockResponse, MockRequestOptions, createMockRequest, createMockResponse} from './httpMock';

export default (app: RequestListener) => (reqOptions: MockRequestOptions) => {
  return new Promise<MockResponse>((resolve) => {
    const req = createMockRequest(reqOptions);
    const res = createMockResponse(req);
    res.on('finish', resolve);
    app(req, res);
  });
}
