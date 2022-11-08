const webpack = require("webpack");
const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const Visualizer = require("webpack-visualizer-plugin");

const dependencies = require("../package.json").dependencies;

const __DEV__ = process.env.NODE_ENV === "development";
const __PROD__ = process.env.NODE_ENV === "production";
const __TEST__ = process.env.NODE_ENV === "test";
const __DEBUG__ = process.env.NODE_ENV === "development";
const __COVERAGE__ = process.env.NODE_ENV === "test";
const __BASENAME__ = process.env.NODE_ENV === process.env.BASENAME || "";

const VENDOR_LIBS = Object.keys(dependencies);

const config = {
  entry: {
    app: [path.resolve("src/main.js")],
    vendor: VENDOR_LIBS,
  },

  output: {
    path: path.resolve("dist"),
    filename: "[name].[hash].js",
    chunkFilename: "[name].[chunkhash].js",
    publicPath: "/",
  },

  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      assets: path.resolve("src/assets"),
      auth: path.resolve("src/auth"),
      components: path.resolve("src/components"),
      general: path.resolve("src/general"),
      layouts: path.resolve("src/layouts"),
      routes: path.resolve("src/routes"),
      service: path.resolve("src/service"),
      store: path.resolve("src/store"),
      styles: path.resolve("src/styles"),
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin(["NODE_ENV", "DEBUG"]),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(__DEV__),
      __PROD__: JSON.stringify(__PROD__),
      __TEST__: JSON.stringify(__TEST__),
      __DEBUG__: JSON.stringify(__DEBUG__),
      __COVERAGE__: JSON.stringify(__COVERAGE__),
      __BASENAME__: JSON.stringify(__BASENAME__),
    }),
    new HTMLWebpackPlugin({
      template: path.resolve("src/ContactUser.html"),
      hash: false,
      favicon: path.resolve("src/static/favicon.ico"),
      filename: "ContactUser.html",
      inject: "body",
      minify: {
        collapseWhitespace: true,
      },
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
    new Visualizer({
      filename: "./statistics.html",
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ["vendor", "manifest"],
      async: true,
      children: true,
      minChunks: 2,
    }),
  ],

  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader" },
      {
        test: /\.woff(\?.*)?$/,
        loader:
          "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff",
      },
      {
        test: /\.woff2(\?.*)?$/,
        loader:
          "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2",
      },
      {
        test: /\.otf(\?.*)?$/,
        loader:
          "file-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype",
      },
      {
        test: /\.ttf(\?.*)?$/,
        loader:
          "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream",
      },
      {
        test: /\.eot(\?.*)?$/,
        loader: "file-loader?prefix=fonts/&name=[path][name].[ext]",
      },
      {
        test: /\.svg(\?.*)?$/,
        loader:
          "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml",
      },
      { test: /\.(png|jpg)$/, loader: "url-loader?limit=8192" },
    ],
  },
};

module.exports = config;
