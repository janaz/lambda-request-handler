const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.set('trust proxy', true); // trust all proxies
app.disable('x-powered-by');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Return proxy info
app.all('/inspect', (req, res) => {
  res.json({
    body: req.body,
    node: process.version,
    trustProxy: app.get('trust proxy'),
    req: {
      cookies: req.cookies,
      fresh: req.fresh,
      hostname: req.hostname,
      method: req.method,
      params: req.params,
      protocol: req.protocol,
      query: req.query,
      secure: req.secure,
      signedCookies: req.signedCookies,
      stale: req.stale,
      subdomains: req.subdomains,
      xhr: req.xhr,
      ip: req.ip,
      ips: req.ips,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      url: req.url,
      xForwardedFor: req.get('x-forwarded-for'),
    },
  });
});

module.exports = app;
