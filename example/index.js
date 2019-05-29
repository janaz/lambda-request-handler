const connect = require('connect');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// app.set('trust proxy', true); // trust all proxies
// app.disable('x-powered-by');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log("PATH", path.join(__dirname, 'public'))

app.use("/static", express.static(path.join(__dirname, 'public')));

// Return proxy info
app.use("/get", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/file.txt'))
})

app.use("/get/next", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/file.txt'))
})

app.use('/inspect', (req, res) => {
  console.log("I'm in!", req.path);
  const ret = {
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
  };
  console.log(ret);
  res.json(ret);
});

module.exports = app;
