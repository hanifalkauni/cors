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
const noProtocol = url => url.startsWith("http://") || url.startsWith("https://");

const App = (props, state) => [
  m(
    "div",
    { id: "content" },
    m(
      "header",
      m("h1", m("a", { href: "/", title: "CORSProxy" }, "CORSProxy")),
      m(
        "p",
        "Access resources from other websites, bypass or unblock sites"
      )
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
          m("input", { type: "checkbox", id: "encode-url" }),
          m("label", { id: "state", for: "encode-url" }, [
            "Encode URL (",
            m("span", "false"),
            ")"
          ])
        ),
        m("input", {
          id: "input",
          name: "url",
          type: "text",
          maxlength: "100",
          placeholder: "Enter URL",
          autocomplete: "off"
        }),
        m("input", { type: "text", id: "output", autocomplete: "off" }),
        m(
          "button",
          {
            type: "button",
            id: "get-url",
            onclick() {
              //count++;
            }
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
const encodeURLstate = $("state").querySelector("span");
const box = $("box");

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
  } else {
    alert.className = "";
    alertContent.style.display = "none";
  }
};

encodeURL.addEventListener(
  "click",
  event => {
    const target = event.target;
    if (target.checked) {
      target.checked = true;
      encodeURLstate.innerText = "true";
    } else {
      target.checked = false;
      encodeURLstate.innerText = "false";
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
      }
      output.focus();
      output.select();
      if (!doc.execCommand) {
        return;
      }
      doc.execCommand("copy");
      output.readOnly = false;
    }
  },
  false
);

output.addEventListener(
  "click",
  () => {
    output.select();
    if (!doc.execCommand) {
      return;
    }
    doc.execCommand("copy");
  },
  false
);
