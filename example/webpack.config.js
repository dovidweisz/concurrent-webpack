const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { createVariantConfig } = require("concurrent-webpack");
const webpack = require("webpack");

const themeColors = {
	light: {
		background: "#dca",
		textColor: "#731",
	},
	dark: {
		background: "#333",
		textColor: "#eee",
	},
	blue: {
		background: "#cde",
		textColor: "#247",
	},
};

function createWebpackConfig({ theme }, argv) {
	const colors = themeColors[theme] || themeColors.light;

	return {
		mode: argv.mode || "development",
		stats: true,
		entry: "./src/index.js",
		output: {
			filename: "main.[contenthash].js",
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
			new webpack.DefinePlugin({
				"process.env.THEME_BACKGROUND": JSON.stringify(
					colors.background
				),
				"process.env.THEME_COLOR": JSON.stringify(colors.textColor),
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
