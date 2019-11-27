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
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const BrotliPlugin = require("brotli-webpack-plugin");
const glob = require("glob");
const configHtml = require("./config.html");

// Production
console.log("Webpack production mode!");

// package.json config
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
// INPUT
const INPUT = `./src`;
// OUTPUT
const OUTPUT = pkg.config.output;

const Config = {
  mode: "production",
  devtool: "none",
  stats: "normal",
  optimization: {
    /*occurrenceOrder: true,
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: "initial",
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0
        },
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          priority: 10,
          enforce: true
        }
      }
    },*/
    minimizer: [
      new TerserPlugin({
        parallel: true,
        cache: true,
        terserOptions: {
          output: {
            comments: false
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
};
const babelLoader = {
  test: /\.m?js$/,
  exclude: /node_modules/,
  loader: "babel-loader",
  options: {
    cacheDirectory: true,
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage", // false, entry
          corejs: 3,
          targets: {
            esmodules: false
          },
          modules: false
        }
      ]
    ],
    plugins: [
      [
        "@babel/plugin-transform-runtime",
        {
          absoluteRuntime: false,
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: false
        }
      ],
      [
        "@babel/plugin-transform-template-literals",
        {
          loose: true
        }
      ],
      "@babel/plugin-syntax-dynamic-import"
    ]
  }
};
const cssLoader = {
  test: /\.css$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader
    },
    {
      loader: "css-loader"
    },
    {
      loader: "postcss-loader"
    }
  ]
};
const fileLoader = {
  test: /\.(png|jpe?g|gif|webp|ico|svg|woff2|woff|eot|ttf|otf|json|webmanifest|txt)$/,
  use: [
    {
      loader: "file-loader",
      options: {
        name: "[name].[ext]"
      }
    }
  ]
};
const plugins = [
  new CleanWebpackPlugin(),
  new CopyWebpackPlugin(
    [
      {
        from: `${INPUT}/img/`,
        to: "img/"
      }
    ],
    { copyUnmodified: true }
  ),
  new HtmlWebpackPlugin({
    ...configHtml,
    sw: `<script>"serviceWorker"in navigator&&window.addEventListener("load",(function(){navigator.serviceWorker.register("sw.js").then((function(e){e.onupdatefound=function(){var n=e.installing;n.onstatechange=function(){switch(n.state){case"installed":navigator.serviceWorker.controller?console.log("New or updated content is available."):console.log("Well done, CORSProxy is now available offline!");break;case"redundant":console.error("The installing service worker became redundant.")}}}})).catch((function(e){console.error("Oh no, we can't offline:",e)}))}));</script>`,
    template: `${INPUT}/index.html`,
    inject: true,
    minify: {
      html5: true,
      useShortDoctype: true,
      decodeEntities: true,
      minifyCSS: true,
      minifyJS: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      preventAttributesEscaping: false,
      removeAttributeQuotes: true,
      removeComments: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeTagWhitespace: false,
      sortAttributes: true,
      sortClassName: false,
      quoteCharacter: '"'
    }
  }),
  new ScriptExtHtmlWebpackPlugin({
    defaultAttribute: "async"
  }),
  new MiniCssExtractPlugin({
    filename: "style.[hash:8].bundle.css",
    chunkFilename: "style.[hash:8].chunk.css"
  }),
  new InjectManifest({
    importWorkboxFrom: "local",
    // importsDirectory: "workbox",
    exclude: [/\.xml$/, /\.txt$/, /\.map$/],
    swDest: "sw.js",
    swSrc: `${INPUT}/pwa.manifest.js`,
    precacheManifestFilename: "cache.[manifestHash].js"
  }),
  new CompressionPlugin({
    filename: "[path].gz[query]",
    algorithm: "gzip",
    test: /\.(js|css|html)$/,
    threshold: 10240,
    minRatio: 0.8
  }),
  new BrotliPlugin({
    asset: "[path].br[query]",
    test: /\.(js|css|html)$/,
    threshold: 10240,
    minRatio: 0.8
  })
];
module.exports = {
  ...Config,
  entry: {
    app: [`${INPUT}/index.js`]
  },
  output: {
    path: path.resolve(__dirname, `../${OUTPUT}`),
    publicPath: "/",
    filename: "[name].[hash:8].bundle.js",
    chunkFilename: "[name].[hash:8].chunk.js"
  },
  module: {
    rules: [babelLoader, cssLoader, fileLoader]
  },
  plugins
};
