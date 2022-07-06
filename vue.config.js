var prependcssvars = `@import "@/styles/variables/common.sass"; @import "@/styles/mixins/common.sass";`;
const path = require('path');
module.exports = {
	devServer: {
		open: process.platform === "darwin",
		host: "0.0.0.0",
		port: 7001, // CHANGE YOUR PORT HERE!
		https: false,
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
		"rxjs-interop"
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
					include: [path.resolve('node_modules/rxjs-interop')]
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
