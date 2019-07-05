import { OutgoingHttpHeaders } from 'http';
import { LambdaResponseHeaders, StringMap } from './types'

const fixResponseHeaders = (headers: OutgoingHttpHeaders, supportMultiHeaders: boolean): LambdaResponseHeaders => {
  const multiValueHeaders: StringMap<string[]> = {};
  const singleValueHeaders: StringMap<string> = {};
  Object.keys(headers).forEach(k => {
    if (Array.isArray(headers[k])) {
      const values = headers[k] as string[];
      singleValueHeaders[k] = values[values.length - 1]
      multiValueHeaders[k] = values;
    } else {
      const value = (headers[k] as string).toString();
      multiValueHeaders[k] = [value];
      singleValueHeaders[k] = value;
    }
  });
  if (singleValueHeaders['transfer-encoding'] === 'chunked') {
    delete singleValueHeaders['transfer-encoding'];
  }
  if (multiValueHeaders['transfer-encoding']) {
    const filtered = multiValueHeaders['transfer-encoding'].filter(v => v !== 'chunked');
    if (filtered.length > 0) {
      multiValueHeaders['transfer-encoding'] = filtered;
    } else {
      delete multiValueHeaders['transfer-encoding']
    }
  }
  if (supportMultiHeaders) {
    return { multiValueHeaders };
  } else {
    return { headers: singleValueHeaders }
  }
};

export default fixResponseHeaders;
