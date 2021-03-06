/* eslint-env node */

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: 3,
        targets: {
          node: "current"
        }
      }
    ]
  ],
  plugins: ["@babel/plugin-transform-runtime"]
};
