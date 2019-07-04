import { OutgoingHttpHeaders } from 'http';
import { LambdaResponseHeaders } from './types'

const fixResponseHeaders = (headers: OutgoingHttpHeaders): LambdaResponseHeaders => {
  const retVal: LambdaResponseHeaders = {
    headers: {},
    multiValueHeaders: {},
  }
  Object.keys(headers).forEach(k => {
    if (k === 'transfer-encoding' && headers[k] === 'chunked') {
      return;
    }
    if (Array.isArray(headers[k])) {
      retVal.multiValueHeaders[k] = headers[k] as string[];
    } else {
      retVal.headers[k] = (headers[k] as string).toString();
    }
  })
  return retVal;
};

export default fixResponseHeaders;
