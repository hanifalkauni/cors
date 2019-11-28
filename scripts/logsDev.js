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
const dev = process.env.NODE_ENV !== "production";

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZone: "UTC"
};
const getDateTime = new Date().toLocaleString("id-ID", dateOptions); // en-US
const logsFile = (fileName, content) => {
  fs.appendFile(fileName, `${content}\r\n`, err => {
    if (err) {
      dev ? console.error(`${getDateTime} > LogsFile Error:`, err) : null;
    }
    //console.log(`LogsFile Info: Wrote ${content} in file ${fileName}.`);
  });
};
//
// logsDev > improve and developed CROSProxy!
//
const logsDev = (() => ({
  info(title, content, options) {
    options = options ? ` ? (${options})` : "";
    dev
      ? console.info(
          `${getDateTime} > CORSProxy [INFO] - ${title}${options}:`,
          ...[content]
        )
      : null;
    logsFile(
      "./data/logs/server/corsproxy-url.txt",
      `${getDateTime} > CORSProxy [INFO] - ${title}${options}: ${content}`
    );
  },
  warn(title, content, options) {
    options = options ? ` ? (${options})` : "";
    dev
      ? console.warn(
          `${getDateTime} > CORSProxy [WARN] - ${title}${options}:`,
          ...[`\r\n${content}`]
        )
      : null;
    logsFile(
      "./data/logs/server/corsproxy-warn.txt",
      `${getDateTime} > CORSProxy [WARN] - ${title}${options}:\r\n${content}\r\n`
    );
  },
  error(title, content, options) {
    options = options ? ` ? (${options})` : "";
    dev
      ? console.error(
          `${getDateTime} > CORSProxy [ERROR] - ${title}${options}:`,
          ...[`\r\n${content}`]
        )
      : null;
    logsFile(
      "./data/logs/server/corsproxy-error.txt",
      `${getDateTime} > CORSProxy [ERROR] - ${title}${options}:\r\n${content}\r\n`
    );
  },
  debug(title, content, options) {
    options = options ? ` ? (${options})` : "";
    dev
      ? console.debug(
          `${getDateTime} > CORSProxy [DEBUG] - ${title}${options}:`,
          ...[content]
        )
      : null;
    logsFile(
      "./data/logs/server/corsproxy-url.txt",
      `${getDateTime} > CORSProxy [DEBUG] - ${title}${options}: ${content}`
    );
  }
}))();
module.exports = logsDev;
