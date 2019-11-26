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
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const { InjectManifest } = require("workbox-webpack-plugin");
const configHtml = require("./config.html");

// Development
console.log("Webpack development mode!");

// package.json config
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
// INPUT
const INPUT = `./src`;
// OUTPUT
const OUTPUT = pkg.config.output;
// PORT
const PORT = pkg.config.port;

const Config = {
  mode: "development",
  devtool: "source-map",
  stats: "normal",
  devServer: {
    port: 8080,
    open: false,
    liveReload: false,
    compress: true,
    clientLogLevel: "error",
    historyApiFallback: true,
    writeToDisk: true,
    hot: true,
    proxy: {
      "/api": `http://localhost:${PORT}`
    }
  },
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
    }*/
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
          useBuiltIns: false, // usage, entry
          // corejs: 3,
          targets: {
            esmodules: false
          },
          modules: false,
          debug: true
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
      loader: "css-loader",
      options: { sourceMap: true }
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
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
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
    sw: "",
    template: `${INPUT}/index.html`,
    inject: true,
    excludeChunks: ["server"]
  }),
  new ScriptExtHtmlWebpackPlugin({
    defaultAttribute: "async"
  }),
  new MiniCssExtractPlugin({
    filename: "style.bundle.css",
    chunkFilename: "style.chunk.css"
  }),
  /*new InjectManifest({
    //importWorkboxFrom: "local",
    // importsDirectory: "workbox",
    exclude: [/\.xml$/, /\.txt$/, /\.map$/],
    swDest: "sw.js",
    swSrc: `${INPUT}/pwa.manifest.js`,
    precacheManifestFilename: "cache.[manifestHash].js"
  }),*/
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin()
];
module.exports = {
  ...Config,
  entry: {
    app: [`${INPUT}/index.js`]
  },
  output: {
    path: path.resolve(__dirname, `../${OUTPUT}`),
    publicPath: "/",
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js"
  },
  module: {
    rules: [babelLoader, cssLoader, fileLoader]
  },
  plugins
};
