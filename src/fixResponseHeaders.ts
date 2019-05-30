import { OutgoingHttpHeaders } from 'http';
const binarycase = require('binary-case');

const fixResponseHeaders = (headers: OutgoingHttpHeaders): OutgoingHttpHeaders => {
  const retVal: OutgoingHttpHeaders = {};
  Object.keys(headers).forEach(k => {
    if (k === 'transfer-encoding' && headers[k] === 'chunked') {
      return;
    }
    if (Array.isArray(headers[k])) {
      const arrayValue = headers[k] as string[];
      if (k === 'set-cookie') {
        arrayValue.forEach((value, i) => {
          retVal[binarycase(k, i)] = value
        });
      } else {
        retVal[k] = arrayValue.join(',');
      }
    } else {
      retVal[k] = headers[k];
    }
  })
  return retVal;
};

export default fixResponseHeaders;
