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
	cjsConfig = {},
}) {
	const baseConfig = {
		...pkgBaseConfig,
		resolve: {
			plugins: [new TsconfigPathsPlugin()],
		},
	};

	const config = { baseConfig };

	config.cjsConfig = {
		module: ssrModule || module,
		...cjsConfig,
	};

	return config;
}

module.exports = generateWebpackConfig;
