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

import "./style.css";
import "./site.webmanifest";
import m from "mithril";

const win = window;
const doc = win.document;

const $ = id => doc.getElementById(id);
const noProtocol = url =>
  url.startsWith("http://") ||
  url.startsWith("https://") ||
  url.startsWith("ftp://");

const App = (props, state) => [
  m(
    "div",
    { id: "content" },
    m(
      "header",
      m("h1", m("a", { href: "/", title: "CORSProxy" }, "CORSProxy")),
      m("p", "Access resources from other websites, bypass or unblock sites")
    ),
    m("main", [
      m("div", { id: "alert" }, m("div", { class: "alert-content" })),
      m("div", { id: "box" }, [
        m(
          "div",
          { className: "info" },
          "Put URL with (http:// or https://) in the form below, press Get URL button to generate URL. Currently only supports ",
          m("strong", "GET"),
          " requests."
        ),
        m(
          "div",
          { className: "settings" },
          m(
            "div",
            m("input", { type: "checkbox", id: "encode-url" }),
            m("label", { id: "encode-url-label", for: "encode-url" }, [
              "Encode URL (",
              m("span", "off"),
              ")"
            ])
          ),
          m(
            "div",
            m("input", { type: "checkbox", id: "new-tab" }),
            m("label", { id: "new-tab-label", for: "new-tab" }, [
              "Open URL in New Tab (",
              m("span", "off"),
              ")"
            ])
          )
        ),
        m(
          "div",
          { className: "input-box" },
          m("input", {
            id: "input",
            type: "text",
            name: "url",
            placeholder: "Enter URL"
          }),
          m(
            "button",
            { type: "button", id: "clear" },
            m(
              "svg",
              { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" },
              m("path", {
                d:
                  "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              })
            )
          )
        ),
        m("input", { type: "text", id: "output", autocomplete: "off" }),
        m(
          "button",
          {
            type: "button",
            id: "get-url"
          },
          "Get URL"
        )
      ])
    ]),
    m("footer", [
      m("span", "Made with ❤️ by"),
      m("a", { href: "https://illvart.com", title: "illvart" }, "illvart"),
      m("br"),
      m(
        "span",
        "This project is open source under the MIT License, check on the"
      ),
      m(
        "a",
        {
          href: "https://github.com/illvart/cors",
          title: "GitHub Repository",
          rel: "noopener noreferrer",
          target: "_blank"
        },
        "GitHub"
      )
    ])
  )
];

m.render($("app"), App());

const input = $("input");
const output = $("output");
const get = $("get-url");
const encodeURL = $("encode-url");
const encodeURLLabel = $("encode-url-label").querySelector("span");
const newTab = $("new-tab");
const newTabLabel = $("new-tab-label").querySelector("span");
const box = $("box");
const clear = $("clear");

output.readOnly = true;
const encode = encodeURIComponent;
const base = `${win.location.href}`;

const why = content => {
  const alert = $("alert");
  const alertContent = alert.querySelector(".alert-content");
  alertContent.innerHTML = content || "";
  if (alert.className === "") {
    alert.className = "active";
    alertContent.style.display = "block";
  }
};
encodeURL.addEventListener(
  "click",
  event => {
    const target = event.target;
    if (target.checked) {
      target.checked = true;
      encodeURLLabel.innerText = "on";
    } else {
      target.checked = false;
      encodeURLLabel.innerText = "off";
    }
  },
  false
);
newTab.addEventListener(
  "click",
  event => {
    const target = event.target;
    if (target.checked) {
      target.checked = true;
      newTabLabel.innerText = "on";
    } else {
      target.checked = false;
      newTabLabel.innerText = "off";
    }
  },
  false
);
get.addEventListener(
  "click",
  event => {
    event.preventDefault();

    // Results of Get URL
    const results = encodeURL.checked
      ? `${base}${encode(input.value)}`
      : `${base}${input.value}`;

    if (input.value === "") {
      why("Sorry, <strong>URL</strong> is empty!");
    } else {
      if (!noProtocol(input.value)) {
        why(
          `Please put http:// or https:// in the URL! Example (https://${input.value})`
        );
      } else if (output.value === results) {
        why("Well done, try different URL!");
      } else {
        output.value = results;
        output.style.display = "block";
        output.focus();
        output.select();
        why(`<strong>URL</strong> copied!`);
        if (!doc.execCommand) {
          return;
        }
        doc.execCommand("copy");
        newTab.checked ? win.open(results) : null;
      }
    }
  },
  false
);
output.addEventListener(
  "click",
  () => {
    if (input.value === "") {
      return false;
    } else {
      output.select();
      why(`<strong>URL</strong> copied!`);
      if (!doc.execCommand) {
        return;
      }
      doc.execCommand("copy");
      return true;
    }
  },
  false
);
input.addEventListener(
  "input",
  () => {
    if (input.value === "") {
      clear.style.display = "none";
    } else {
      clear.style.display = "inline";
    }
  },
  false
);
clear.addEventListener(
  "click",
  () => {
    if (input.value === "") {
      return false;
    } else {
      input.value = "";
      clear.style.display = "none";
      return true;
    }
  },
  false
);
