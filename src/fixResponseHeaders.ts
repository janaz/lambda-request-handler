import { OutgoingHttpHeaders } from 'http';
import { LambdaResponseHeaders } from './types'

const fixResponseHeaders = (headers: OutgoingHttpHeaders): LambdaResponseHeaders => {
  const retVal: LambdaResponseHeaders = {
    multiValueHeaders: {},
  }
  Object.keys(headers).forEach(k => {
    if (Array.isArray(headers[k])) {
      retVal.multiValueHeaders[k] = headers[k] as string[];
    } else {
      retVal.multiValueHeaders[k] = [(headers[k] as string).toString()];
    }
  });
  if (retVal.multiValueHeaders['transfer-encoding']) {
    const filtered = retVal.multiValueHeaders['transfer-encoding'].filter(v => v !== 'chunked');
    if (filtered.length > 0) {
      retVal.multiValueHeaders['transfer-encoding'] = filtered;
    } else {
      delete retVal.multiValueHeaders['transfer-encoding']
    }
  }
  return retVal;
};

export default fixResponseHeaders;
