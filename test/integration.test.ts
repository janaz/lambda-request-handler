import app from './app';
import lambda from '../src/lambda';

import event from './fixtures/event.json';

const handler = lambda(app);

describe('integration', () => {
  it('handles API GW event', () => {
    return handler(event).then(response => {
      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(false);
      expect(response.headers["content-type"]).toEqual('application/json; charset=utf-8');
      expect(response.headers["x-powered-by"]).toEqual('Express');
      const json = JSON.parse(response.body.toString());
      expect(json).toEqual({
        baseUrl: "",
        body: {},
        cookies: {
          s_fid: "39BE527E3767FB80-174D965C9E0459D6",
          utag_main: "v_id:016460035de500182b7d0eaa1b650307800430700093c$_sn:2$_ss:1$_st:1542333456244$ses_id:1542331656244;exp-session$_pn:1;exp-session",
        },
        fresh: false,
        hostname: "uqho4e39s9.execute-api.ap-southeast-2.amazonaws.com",
        ip: "203.13.23.10",
        ips: [],
        method: "GET",
        originalUrl: "/reflect",
        params: {},
        path: "/reflect",
        protocol: "https",
        query: {},
        secure: true,
        signedCookies: {},
        stale: true,
        subdomains: [
          "ap-southeast-2",
          "execute-api",
          "uqho4e39s9",
        ],
        url: "/reflect",
        xForwardedFor: "203.13.23.10, 70.132.29.78",
        xhr: false,
      })
    })
  })
})
