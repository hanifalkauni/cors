module.exports = {
  plugins: [
    require("postcss-preset-env")({}),
    require("cssnano")({
      preset: "default"
    }),
    require("css-declaration-sorter")()
  ]
};
