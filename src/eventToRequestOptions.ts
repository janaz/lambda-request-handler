import * as url from 'url';

import { InProcessRequestOptions } from 'in-process-request';
import { APIGatewayEvent, StringMap, LambdaContext } from './types';

const getValuesFromStringAndMultiString = (stringMap: StringMap<string> | null | undefined, multiStringMap: StringMap<string[]> | null | undefined): StringMap<string> => {
  const retVal: StringMap<string> = {};
  const singleMap = stringMap || {};
  Object.keys(singleMap).forEach(k => {
    retVal[k.toLowerCase()] = singleMap[k];
  });
  const multiMap = multiStringMap || {};
  Object.keys(multiMap).forEach(k => {
    // get the last value
    retVal[k.toLowerCase()] = multiMap[k][multiMap[k].length - 1];
  });
  return retVal;
}

const eventToRequestOptions = (event: APIGatewayEvent, ctx?: LambdaContext): InProcessRequestOptions => {
  let remoteAddress:string | undefined = undefined;
  let ssl = false;
  const headers = getValuesFromStringAndMultiString(event.headers, event.multiValueHeaders);
  if (ctx) {
    headers['x-aws-lambda-request-id'] = ctx.awsRequestId;
  }
  const queryStringParams = getValuesFromStringAndMultiString(event.queryStringParameters, event.multiValueQueryStringParameters);
  if (event.requestContext && event.requestContext.elb) {
    //load balancer request - it has the client ip in x-forwarded-for header
    if (typeof headers['x-forwarded-for'] === 'string') {
      const ips = (headers['x-forwarded-for'] as string).split(' ');
      remoteAddress = ips[ips.length - 1];
      ips.splice(-1, 1)
      headers['x-forwarded-for'] = ips.join(' ');
      ssl = headers['x-forwarded-proto'] === 'https';
      if (ips.length === 0) {
        delete headers['x-forwarded-for'];
        delete headers['x-forwarded-port'];
        delete headers['x-forwarded-proto'];
      }
    }
    //elb also doesn't uri decode query string params
    Object.keys(queryStringParams).forEach(k => {
      queryStringParams[k] = decodeURIComponent(queryStringParams[k])
    })
  } else {
    // api gateway request
    ssl = true;
    remoteAddress = event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp
  }
  return {
    method: event.httpMethod,
    path: url.format({ pathname: event.path, query: queryStringParams }),
    headers: headers,
    body: Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8'),
    ssl,
    remoteAddress
  };
}
export default eventToRequestOptions;
