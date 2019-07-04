import eventToRequestOptions from '../src/eventToRequestOptions';

import event from './fixtures/event.json';
import eventHealth from './fixtures/health-event.json';

describe('eventToRequestOptions', () => {
  it('converts Api Gateway event to RequestOptions object', () => {
    const reqOpts = eventToRequestOptions(event);
    expect(reqOpts).toEqual({
      "method": "GET",
      "path": "/reflect",
      "remoteAddress": "203.13.23.10",
      "body": Buffer.alloc(0),
      "ssl": true,
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
        "Host": "apiid.execute-api.ap-southeast-2.amazonaws.com",
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

  describe('ALB', () => {
    it('sets remote ip address based on x-forwarded headers', () => {
      const reqOpts = eventToRequestOptions({
        path: '/',
        httpMethod: 'HEAD',
        body: null,
        headers: {
          "x-forwarded-for": "10.10.2.3 129.45.45.48",
          "x-forwarded-proto": "http",
        },
        queryStringParameters: {},
        isBase64Encoded: false,
        requestContext: {
          elb: {
            targetGroupArn: 'arn'
          }
        }
      });
      expect(reqOpts).toEqual({
        "method": "HEAD",
        "path": "/",
        "remoteAddress": '129.45.45.48',
        "body": Buffer.alloc(0),
        "ssl": false,
        "headers":  {
          "x-forwarded-for": "10.10.2.3",
          "x-forwarded-proto": "http",
        },
      })
    })

    it('removes x-forwarded headers if there is just one ip in the chain', () => {
      const reqOpts = eventToRequestOptions({
        path: '/',
        httpMethod: 'HEAD',
        body: null,
        headers: {
          "x-forwarded-for": "129.45.45.48",
          "x-forwarded-proto": "https",
          "x-forwarded-port": "443",
        },
        queryStringParameters: {},
        isBase64Encoded: true,
        requestContext: {
          elb: {
            targetGroupArn: 'arn'
          }
        }
      });

      expect(reqOpts).toEqual({
        "method": "HEAD",
        "path": "/",
        "remoteAddress": '129.45.45.48',
        "body": Buffer.alloc(0),
        "ssl": true,
        "headers":  {
        },
      })
    });

    it('converts ELB health check event to RequestOptions object', () => {
      const reqOpts = eventToRequestOptions(eventHealth);
      expect(reqOpts).toEqual({
        "method": "HEAD",
        "path": "/",
        "remoteAddress": undefined,
        "body": Buffer.alloc(0),
        "ssl": false,
        "headers":  {
          "user-agent": "ELB-HealthChecker/2.0",
        },
      })
    })
  })

})
