module.exports = {
	presets: ["@vue/cli-plugin-babel/preset", "@babel/preset-env"],
	plugins: [
		"@babel/plugin-transform-typescript",
		"@babel/plugin-transform-runtime",
		"@babel/plugin-transform-async-to-generator",
		"@babel/plugin-proposal-async-generator-functions",
		"@babel/plugin-syntax-async-generators",
		"@babel/plugin-proposal-optional-chaining",
		"@babel/plugin-proposal-nullish-coalescing-operator",
	],
};
