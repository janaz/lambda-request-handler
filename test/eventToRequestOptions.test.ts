import eventToRequestOptions from '../src/eventToRequestOptions';

import event = require('./fixtures/event.json');
import eventHealth = require('./fixtures/health-event.json');

describe('eventToRequestOptions', () => {
  it('converts Api Gateway event to RequestOptions object', () => {
    const reqOpts = eventToRequestOptions(event);
    expect(reqOpts).toEqual({
      "method": "GET",
      "path": "/inspect",
      "remoteAddress": "203.13.23.10",
      "body": Buffer.alloc(0),
      "headers":  {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "Accept-Language": "en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,ru;q=0.6",
        "CloudFront-Forwarded-Proto": "https",
        "CloudFront-Is-Desktop-Viewer": "true",
        "CloudFront-Is-Mobile-Viewer": "false",
        "CloudFront-Is-SmartTV-Viewer": "false",
        "CloudFront-Is-Tablet-Viewer": "false",
        "CloudFront-Viewer-Country": "AU",
        "Cookie": "s_fid=39BE527E3767FB80-174D965C9E0459D6; utag_main=v_id:016460035de500182b7d0eaa1b650307800430700093c$_sn:2$_ss:1$_st:1542333456244$ses_id:1542331656244%3Bexp-session$_pn:1%3Bexp-session",
        "Host": "uqho4e39s9.execute-api.ap-southeast-2.amazonaws.com",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36",
        "Via": "2.0 cab8093de9e922f6aac9f66e51afc0cc.cloudfront.net (CloudFront)",
        "X-Amz-Cf-Id": "FSKKKFnTkJp31QMTse9jJmnI26UCUDDO_w36IsM1KhhBnh9-4m8f9g==",
        "X-Amzn-Trace-Id": "Root=1-5cd52046-cc5dd96e659172ee28e86d1a",
        "X-Forwarded-For": "203.13.23.10, 70.132.29.78",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https",
        "accept-encoding": "gzip, deflate, br",
        "cache-control": "max-age=0",
        "upgrade-insecure-requests": "1",
      },
    })
  })

  it('converts Api Gateway health check event to RequestOptions object', () => {
    const reqOpts = eventToRequestOptions(eventHealth);
    expect(reqOpts).toEqual({
      "method": "GET",
      "path": "/inspect",
      "remoteAddress": undefined,
      "body": Buffer.alloc(0),
      "headers":  {
        "user-agent": "ELB-HealthChecker/2.0",
      },
    })
  })

})
