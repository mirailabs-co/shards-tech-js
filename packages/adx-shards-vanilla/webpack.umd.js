const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: './src/index.ts',
	output: {
		path: path.resolve(__dirname, 'dist/umd'),
		filename: 'adx-shards-vanilla.js',
		library: 'ShardsDSP',
		libraryTarget: 'umd',
		globalObject: 'this',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					format: {
						comments: false,
					},
				},
			}),
		],
	},
};
