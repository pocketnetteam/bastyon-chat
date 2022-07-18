var prependcssvars = `@import "@/styles/variables/common.sass"; @import "@/styles/mixins/common.sass";`;
const path = require('path');
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
	"transpileDependencies": [
		"rxjs-interop",
		"standardized-audio-context"
	],
	configureWebpack: {
		resolve: {
			extensions: [".js", ".ts"],
		},
		output: {
			pathinfo: false,
		},

		module: {
			rules: [
				{
					loader: "babel-loader",
					test: "/.(js)$/",
					include: [path.resolve('node_modules/rxjs-interop'), path.resolve('node_modules/standardized-audio-context')]
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
