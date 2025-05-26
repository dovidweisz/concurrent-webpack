const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { createVariantConfig } = require("concurrent-webpack");

function createWebpackConfig({ theme }, argv) {
	return {
		mode: argv.mode || "development",
		stats: true,
		entry: "./src/index.js",
		output: {
			filename: "main.js",
			path: path.resolve(__dirname, "dist", theme),
			clean: true,
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: [
								"@babel/preset-env",
								"@babel/preset-react",
							],
						},
					},
				},
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"],
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: "./public/index.html",
			}),
		],
		devServer: {
			static: {
				directory: path.join(__dirname, "dist"),
			},
			compress: true,
			port: 9000,
		},
	};
}

module.exports = (env, argv) => {
	return createVariantConfig(variantSettings =>
		createWebpackConfig(variantSettings, argv)
	);
};
