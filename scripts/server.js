/* eslint no-console:'off' */
/* eslint-env node */

/**
 * @license
 * Copyright Muhammad Nur Fuad (illvart) All Rights Reserved.
 * https://github.com/illvart
 *
 * This code licensed under the MIT License.
 * LICENSE file at https://github.com/illvart/cors/blob/master/LICENSE
 */

"use strict";
const fs = require("fs");
const path = require("path");
const express = require("express");
const request = require("request");
const proxy = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const useragent = require("express-useragent");
const logsDev = require("./logsDev");
const blacklistUrl = require("../data/blacklist-url");
const blacklistWords = require("../data/blacklist-words");
const dev = process.env.NODE_ENV !== "production";

// Express
const app = express();

// package.json config
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
// OUTPUT
const OUTPUT = pkg.config.output;
// PORT
const PORT = pkg.config.port;

// No thanks.
const words = new RegExp(`/${blacklistWords}/`);
// No protocol?
const noProtocol = url =>
  url.startsWith("http://") ||
  url.startsWith("https://") ||
  url.startsWith("ftp://");
// Has Encode?
const hasEncode = url =>
  encodeURIComponent(url) ? decodeURIComponent(url) : url;
let headersBlacklist = ["host", "cookie", "set-cookie", "set-cookie2"];
const allowedMethods = "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS";
const allowedHeaders =
  "Origin,X-Requested-With,contentType,Content-Type,Accept,Authorization,X-Auth-Token";
// Cors options
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "contentType",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Auth-Token"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// https://github.com/chimurai/http-proxy-middleware
// https://github.com/request/request

const CORSProxy = (req, res, next) => {
  /*req.getUrl = () => req.protocol + "://" + req.get("host") + req.originalUrl;*/
  let url = req.url.substr(1);
  url = hasEncode(url);
  if (url.match(words)) {
    res.statusCode = 403;
    return res.end(
      `Phrase (${url.match(words)}) in URL not allowed by CORSProxy.`
    );
  } else if (blacklistUrl.includes(url)) {
    res.statusCode = 403;
    return res.end(`URL (${url}) not allowed by CORSProxy.`);
  } else {
    const headers = {};
    for (const header in req.headers) {
      if (!!headersBlacklist.includes(header.toLowerCase())) {
        headers[header] = req.headers[header];
      }
    }
    const forwardedFor = req.headers["X-Fowarded-For"];
    headers["X-Fowarded-For"] =
      (forwardedFor ? `${forwardedFor},` : "") + req.connection.remoteAddress;
    logsDev.info(
      "URL's",
      url,
      `Browser: ${req.useragent.browser} v${req.useragent.version}, OS: ${req.useragent.os}`
    );
    try {
      proxy({
        target: url,
        changeOrigin: true,
        logLevel: "silent"
      });
      request({ url, header: headers }, (error, response, body) => {
        const status = response && response.statusCode;
        if (status) {
          logsDev.info("Status", status);
        }
        if (error) {
          logsDev.warn(
            "Why",
            error,
            `Browser: ${req.useragent.browser} v${req.useragent.version}, OS: ${req.useragent.os}`
          );
          setTimeout(() => {
            res.redirect("..");
          }, 3000);
        } else {
          //logsDev.debug("Body", body);
          logsDev.debug("Type", response.headers["content-type"]);
          let himer = {
            ...response.headers,
            ...{
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": allowedMethods,
              "Access-Control-Max-Age": "86400", // Cache preflight 24 hrs
              "Access-Control-Allow-Headers": allowedHeaders
            }
          };
          //logsDev.debug("Headers", himer);
          res.set(himer);
          res.send(body);
        }
      }).on("data", data => {
        /*const foo = [];
        foo.forEach(bar => {
          console.log(data.includes(bar));
          return (so[data] = "foo bar");
        });*/
      });
    } catch (err) {
      logsDev.error(
        "Catch",
        err,
        `Browser: ${req.useragent.browser} v${req.useragent.version}, OS: ${req.useragent.os}`
      );
      res.redirect("..");
      //res.redirect("back");
    }
  }
};
app.use(compression());
app.use(useragent.express());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/", (req, res, next) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.set("X-UA-Compatible", "IE=Edge");
  next();
});
app.get("/index.html", (req, res, next) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.set("Content-Type", "IE=Edge");
  next();
});
app.disable("x-powered-by");
const staticOptions = {
  dotfiles: "ignore",
  etag: false,
  redirect: false,
  setHeaders(res) {
    res.set("X-Timestamp", Date.now());
    res.set("Server", "illvart.com");
    res.set("X-Powered-By", "Node.js");
    res.set("X-DNS-Prefetch-Control", "on");
    res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.set(
      "Content-Security-Policy-Report-Only",
      "report-uri https://illvart.report-uri.com/r/d/ct/reportOnly"
    );
    res.set("X-Frame-Options", "DENY");
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Referrer-Policy", "no-referrer-when-downgrade");
    res.set(
      "Feature-Policy",
      "camera 'none';geolocation 'none';microphone 'none'"
    );
    res.set(
      "Expect-CT",
      'enforce, max-age=0, report-uri="https://illvart.report-uri.com/r/d/ct/reportOnly"'
    );
    res.set(
      "X-XSS-Protection",
      "1; mode=block; report=https://illvart.report-uri.com/r/d/xss/reportOnly"
    );
  }
};
app.use(express.static(OUTPUT, staticOptions), cors(corsOptions));
app.get("*", (req, res, next) => {
  CORSProxy(req, res, next);
});
app.listen(PORT.server, () => {
  console.log(`Starting CORSProxy server, serving at ${OUTPUT}/`);
  console.log("Available on:");
  console.log(`  http://localhost:${PORT.server}`);
  console.log(`  http://127.0.0.1:${PORT.server}`);
  console.log("Press Ctrl+C to quit.");
});
