const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

function generateWebpackConfig({
	pkg,
	currentPath,
	alias,
	module = {},
	fallback,
	ssrModule = null,
	pkgBaseConfig = {},
	umdConfig = {},
	cjsConfig = {},
}) {
	const baseConfig = {
		...pkgBaseConfig,
		resolve: {
			plugins: [new TsconfigPathsPlugin()],
		},
	};

	const config = { baseConfig };
	config.umdConfig = {
		module,
		...umdConfig,
	};

	config.cjsConfig = {
		module: ssrModule || module,
		...cjsConfig,
	};

	return config;
}

module.exports = generateWebpackConfig;
