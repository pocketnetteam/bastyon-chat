var prependcssvars = `@import "@/styles/variables/common.sass"; @import "@/styles/mixins/common.sass";`;
const path = require("path");
module.exports = {
	devServer: {
		open: process.platform === "darwin",
		host: "0.0.0.0",
		port: 8080, // CHANGE YOUR PORT HERE!
		https: true,
		hotOnly: false,
	},

	publicPath: "/",
	lintOnSave: false,

	css: {
		loaderOptions: {
			sass: {
				prependData: prependcssvars,
			},
		},
	},

	runtimeCompiler: true,
	transpileDependencies: ["rxjs-interop", "standardized-audio-context"],

	productionSourceMap: false,

	pluginOptions: {
		webpackBundleAnalyzer: {
			openAnalyzer: false,
			analyzerMode: "disabled",
		},
	},

	configureWebpack: {
		resolve: {
			extensions: [".js", ".ts"],
			alias: {
				"standardized-audio-context": path.resolve(
					"node_modules/standardized-audio-context/build/es5/bundle.js"
				),
			},
		},
		output: {
			pathinfo: false,
		},

		module: {
			rules: [
				{
					loader: "babel-loader",
					test: "/.(js)$/",
					include: [
						path.resolve("node_modules/rxjs-interop"),
						path.resolve("node_modules/standardized-audio-context"),
					],
				},
				{
					test: /\.(ts|tsx)?$/,
					use: "ts-loader",
				},
				{
					test: /\.wasm$/,
					loaders: ["wasm-loader"],
				},
			],
		},
	},
};
