import { OutgoingHttpHeaders } from 'http';
import { LambdaResponseHeaders, StringMap } from './types'
import variations from './setCookieVariations';

const fixResponseHeaders = (headers: OutgoingHttpHeaders, supportMultiHeaders: boolean, supportCookies: boolean): LambdaResponseHeaders => {
  const multiValueHeaders: StringMap<string[]> = {};
  const singleValueHeaders: StringMap<string> = {};
  let cookies: string[] | undefined = undefined
  Object.keys(headers).forEach(k => {
    if (Array.isArray(headers[k])) {
      const values = headers[k] as string[];
      multiValueHeaders[k] = values;
      if (k === 'set-cookie') {
        if (supportCookies) {
          cookies = values
        } else {
          values.forEach((value, i) => {
            singleValueHeaders[variations[i]] = value
          });
        }
      } else {
        singleValueHeaders[k] = values.join(',');
      }
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
    return { headers: singleValueHeaders, cookies }
  }
};

export default fixResponseHeaders;
