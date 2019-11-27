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
// Has Encode?
const hasEncode = url =>
  encodeURIComponent(url) ? decodeURIComponent(url) : url;
let headersBlacklist = new Set(["host", "cookie", "set-cookie", "set-cookie2"]);

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
const staticOptions = {
  dotfiles: "ignore",
  etag: false,
  setHeaders(res, path, stat) {
    res.set("x-timestamp", Date.now());
  }
};

// https://github.com/chimurai/http-proxy-middleware
// https://github.com/request/request

const CORSProxy = (req, res, next) => {
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
      if (!headersBlacklist.has(header.toLowerCase())) {
        headers[header] = req.headers[header];
      }
    }
    const forwardedFor = req.headers["X-Fowarded-For"];
    headers["X-Fowarded-For"] =
      (forwardedFor ? `${forwardedFor},` : "") + req.connection.remoteAddress;
    console.log("CORSProxy URL's:", url);

    try {
      proxy({
        target: url,
        changeOrigin: true
      });

      request(
        {
          url,
          header: headers
        },
        (error, response, body) => {
          const status = response && response.statusCode;
          if (status) console.log("CORSProxy Status:", status);
          if (error) {
            console.log("CORSProxy", error);
            setTimeout(() => {
              res.redirect("..");
            }, 3000);
          } else {
            //console.log("CORS Body:", body);
            console.log("CORSProxy Type:", response.headers["content-type"]);
            //delete response.headers["set-cookie"];
            //delete response.headers["set-cookie2"];
            let himer = {
              ...response.headers,
              ...{
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": allowedMethods,
                "Access-Control-Max-Age": "86400", // Cache preflight 24 hrs
                "Access-Control-Allow-Headers": allowedHeaders
              }
            };
            console.log("CORSProxy Headers:", himer);
            res.set(himer);
            res.send(body);
          }
        }
      );
    } catch (err) {
      console.log("CORSProxy Catch:", err);
      res.redirect("..");
      //res.redirect("back");
    }
  }
};

app.use(express.static(OUTPUT, staticOptions), cors(corsOptions));
app.get("/", (req, res) => {
  res.set("Content-Type", "text/html");
  res.sendFile(__dirname + `/${OUTPUT}/index.html`);
  res.end();
});
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (!dev) {
  app.get("/sw.js", (req, res) => {
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.set("Content-Type", "application/javascript");
    res.sendFile("/sw.js", { root: "./" });
  });
}

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
