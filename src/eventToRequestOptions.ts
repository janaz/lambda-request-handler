import * as url from 'url';

import { InProcessRequestOptions } from 'in-process-request';
import { APIGatewayEvent, StringMap, LambdaContext } from './types';

const getValuesFromStringAndMultiString = (stringMap: StringMap<string> | null | undefined, multiStringMap: StringMap<string[]> | null | undefined, lcKeys = true): StringMap<string> => {
  const retVal: StringMap<string> = {};
  const singleMap = stringMap || {};
  Object.keys(singleMap).forEach(k => {
    retVal[lcKeys ? k.toLowerCase() : k] = singleMap[k];
  });
  const multiMap = multiStringMap || {};
  Object.keys(multiMap).forEach(k => {
    // get the last value
    retVal[lcKeys ? k.toLowerCase() : k] = multiMap[k][multiMap[k].length - 1];
  });
  return retVal;
}

const eventToRequestOptions = (event: APIGatewayEvent, ctx?: LambdaContext): InProcessRequestOptions => {
  let remoteAddress:string | undefined = undefined;
  let ssl = false;
  const queryStringParams = getValuesFromStringAndMultiString(event.queryStringParameters, event.multiValueQueryStringParameters, false);
  const headers = getValuesFromStringAndMultiString(event.headers, event.multiValueHeaders);
  if (ctx) {
    headers['x-aws-lambda-request-id'] = ctx.awsRequestId;
  }
  if (event.requestContext && event.requestContext.elb) {
    //load balancer request - it has the client ip in x-forwarded-for header
    if (typeof headers['x-forwarded-for'] === 'string') {
      const ips = headers['x-forwarded-for'].split(',').map(ip => ip.trim());
      remoteAddress = ips.splice(-1, 1)[0]
      headers['x-forwarded-for'] = ips.join(', ');
      ssl = headers['x-forwarded-proto'] === 'https';
      if (ips.length === 0) {
        delete headers['x-forwarded-for'];
        delete headers['x-forwarded-port'];
        delete headers['x-forwarded-proto'];
      }
    }
    //elb doesn't uri decode query string params
    Object.keys(queryStringParams).forEach(k => {
      queryStringParams[k] = decodeURIComponent(queryStringParams[k])
    })
  } else {
    // api gateway request
    ssl = true;
    const remoteAddressList = event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp
    if (remoteAddressList) {
      // HTTP API includes the full x-forwarder for chain here and the remote ip is the last element
      const items = remoteAddressList.split(',').map(s => s.trim());
      remoteAddress = items[items.length - 1];
    }
  }
  let method: string | undefined= event.httpMethod;
  let path: string | undefined = event.path;
  if (event.requestContext && typeof event.requestContext.http === 'object') {
    method = event.requestContext.http.method
    path = event.requestContext.http.path
  }
  return {
    method,
    path: url.format({ pathname: path, query: queryStringParams }),
    headers: headers,
    body: Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8'),
    ssl,
    remoteAddress
  };
}
export default eventToRequestOptions;
