# concurrent-webpack

## Introduction

`concurrent-webpack` is a powerful utility designed to simplify the management and execution of multiple, variant-specific Webpack builds. If you need to generate different versions of your application—such as themed builds, builds with different feature flags, or environment-specific bundles (e.g., development, staging, production)—this plugin helps you run these builds concurrently, speeding up your overall build process.

It leverages a declarative approach for defining build variants and provides a clean way to customize your Webpack configuration for each specific variant.

> **Note:** `concurrent-webpack` is intended as a modern replacement for the now-deprecated `parallel-webpack` package. While it serves a similar purpose—running multiple Webpack builds in parallel—it is **not** a drop-in replacement. One key difference is that `concurrent-webpack` invokes the Webpack CLI directly for each variant, rather than using the Webpack Node API as `parallel-webpack` did. This approach ensures that all standard Webpack CLI arguments and features are fully supported, providing greater compatibility and flexibility with the latest Webpack ecosystem.

## Features

- **Parallel Builds**: Significantly reduce total build time by running multiple Webpack compilations in parallel.
- **External Variant Definition**: Define all your build dimensions (e.g., theme, environment, features) and their possible values in a clear JSON file (`.concurrentWPVariants.json`).
- **Dynamic Webpack Configuration**: Easily tailor your Webpack setup for each specific build variant using a simple callback mechanism. Access variant options directly within your `webpack.config.js`.
- **Automated Variant Naming**: Generates unique names for each variant (e.g., `development-light-alpha`), which can be used in output paths and filenames.
- **Seamless Integration**: Works with your existing Webpack setup.

## Installation

You can install `concurrent-webpack` using either Yarn or npm. Make sure you have Webpack already set up in your project.

**Using Yarn:**

```bash
yarn add concurrent-webpack --dev
```

**Using npm:**

```bash
npm install concurrent-webpack --save-dev
```

It's recommended to install it as a development dependency as it's primarily a build-time tool.

## Configuration

To use `concurrent-webpack`, you'll need to configure three main parts: your project's `package.json` to invoke the tool, a `.concurrentWPVariants.json` file to define your build variants, and your `webpack.config.js` to adapt to these variants.

### 1. `package.json` (Executable)

The `concurrent-webpack` package provides an executable named `concurrent-webpack`. You'll typically use this in the `scripts` section of your `package.json` to trigger your variant builds.

```json
// package.json
{
	// ... other package.json content
	"scripts": {
		"build:variants": "concurrent-webpack"
		// or, if you need to pass additional webpack arguments:
		// "build:variants": "concurrent-webpack --mode=production",
	}
}
```

Any arguments passed after `concurrent-webpack` (like `--mode=production` or `--progress`) are forwarded to each underlying Webpack build process.

### 2. `.concurrentWPVariants.json`

This file is where you define the different dimensions (keys) and options (values) for your builds. The plugin will generate all possible unique combinations from these definitions.

Create a file named `.concurrentWPVariants.json` in the root of your project.

**Structure:**

The expected structure is an object where each key represents a variant dimension, and its value is an array of strings or numbers representing the options for that dimension.

```json
// .concurrentWPVariants.json
{
	"environment": ["development", "production"],
	"theme": ["light", "dark", "blue"],
	"featureSet": ["core", "extended"]
}
```

In this example, `concurrent-webpack` would generate builds for 2 (environments) \* 3 (themes) \* 2 (featureSets) = 12 different variant combinations (e.g., a "development-light-core" build, a "production-blue-extended" build, etc.).

### 3. `webpack.config.js`

Your Webpack configuration file needs to be adapted to use the `createVariantConfig` helper provided by this plugin. This helper allows you to easily access the options for the current variant being built.

`createVariantConfig` is a higher-order function that you call with your configuration-building callback. It returns a `Promise` that resolves to the Webpack configuration object(s).

```javascript
// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { createVariantConfig } = require("concurrent-webpack");

module.exports = async (env, argv) => {
	// env: Environment object, will contain __CCWP_BUILD_OPTIONS from the plugin.
	// argv: Arguments passed to webpack CLI.

	return createVariantConfig(async options => {
		// options: ConfigCallbackOptions
		// Example: { environment: 'development', theme: 'light', featureSet: 'core', ccwpName: 'development-light-core' }
		// ccwpName is automatically generated by the plugin.

		console.log(`Building variant: ${options.ccwpName}`);
		console.log("Variant options:", options);

		const isProduction = options.environment === "production";
		const variantIdentifier = options.ccwpName || "default";

		return {
			mode: isProduction ? "production" : "development",
			name: variantIdentifier, // Recommended for clarity in logs and stats
			entry: "./src/index.js", // Your application's entry point
			output: {
				path: path.resolve(__dirname, "dist", variantIdentifier),
				filename: `[name]-${variantIdentifier}.js`, // [name] is main by default
				publicPath: `/`, // Adjust as needed
				clean: true, // Cleans the specific variant's output directory
			},
			module: {
				rules: [
					{
						test: /\.(js|jsx)$/,
						exclude: /node_modules/,
						use: "babel-loader", // Ensure babel-loader and presets are configured
					},
					{
						test: /\.css$/,
						use: ["style-loader", "css-loader"],
					},
					// Add other loaders as needed
				],
			},
			plugins: [
				new HtmlWebpackPlugin({
					template: "./public/index.html", // Path to your HTML template
					title: `App - ${variantIdentifier}`,
					// You can pass more options to your template if needed
					// myTheme: options.theme,
				}),
				// Add other plugins as needed
			],
			// Add other Webpack options like resolve, optimization, devServer etc.
			// Example for optimization:
			// optimization: {
			//   minimize: isProduction,
			// },
		};
	});
};
```

**Key points for `webpack.config.js`:**

- The exported function can be `async` because `createVariantConfig` returns a `Promise`.
- `createVariantConfig` is called with a callback function.
- This callback receives an `options` object containing the current variant's key-value pairs (e.g., `options.environment`, `options.theme`) and a special `ccwpName` (e.g., "development-light-core").
- Use these `options` to dynamically adjust your Webpack settings:
    - Set `mode` (production/development).
    - Define unique output paths and filenames to prevent conflicts (e.g., `dist/development-light-core/main-development-light-core.js`).
    - Configure plugins or loaders differently based on variants.
    - Set `output.clean: true` is generally safe if each variant outputs to a unique subdirectory. If output paths might overlap, manage cleaning carefully (e.g., clean the entire `dist` once before all builds).

## Usage

Once you have configured your `package.json`, `.concurrentWPVariants.json`, and `webpack.config.js` as described above, you can run your variant builds.

1.  **Ensure Dependencies are Installed:**
    If you haven't already, or if you've updated `package.json` or plugin versions:

    ```bash
    yarn install
    # or
    npm install
    ```

2.  **Run the Build Script:**
    Execute the script you defined in your `package.json`. For example, if you added:

    ```json
    // package.json
    "scripts": {
      "build:variants": "concurrent-webpack"
    }
    ```

    You would run:

    ```bash
    yarn build:variants
    # or
    npm run build:variants
    ```

3.  **Output:**
    The `concurrent-webpack` script will then invoke Webpack for each combination of variants you defined. You should see output in your console indicating the progress of these builds.

    If your `webpack.config.js` is set up to output to variant-specific directories (as shown in the configuration example), you will find the build artifacts for each variant in distinct subfolders within your output directory (e.g., `dist/development-light-core/`, `dist/production-dark-extended/`, etc.). Each folder will contain the assets for that specific build.

    Example console output might look like (simplified):

    ```
    [development-light-core] Building...
    [development-light-extended] Building...
    [production-dark-core] Building...
    ...
    [development-light-core] Build successful! Output at dist/development-light-core
    [development-light-extended] Build successful! Output at dist/development-light-extended
    [production-dark-core] Build successful! Output at dist/production-dark-core
    ...
    All variant builds completed.
    ```

    The exact logging and behavior will depend on the `concurrent-webpack`'s implementation and your Webpack configuration.

## API Reference (Key Exports)

This section provides a brief overview of the primary exports and types you'll interact with when configuring your Webpack builds with `concurrent-webpack`.

### `createVariantConfig(configCB: ConfigCallback): Promise<WebpackConfig | WebpackConfig[]>`

- **Description**: A higher-order function that you use in your `webpack.config.js` to generate variant-specific configurations.
- **Parameters**:
    - `configCB: ConfigCallback` - A callback function that you provide. This function is responsible for returning a Webpack configuration object for a given variant.
- **Returns**: `Promise<WebpackConfig | WebpackConfig[]>` - A Promise that resolves to either a single Webpack configuration object or an array of them. Your `webpack.config.js` should export an `async` function if you `await` this promise, or return the promise directly.

### `ConfigCallback`

This is the type definition for the callback function you pass to `createVariantConfig`.

- **Signature**: `(options: ConfigCallbackOptions) => WebpackConfig`
- **Parameters**:
    - `options: ConfigCallbackOptions` - An object containing the specific key-value pairs for the current build variant, plus a special `ccwpName` property.

### `ConfigCallbackOptions`

This type defines the structure of the `options` object passed to your `ConfigCallback`.

- **Type**: `Variant & { ccwpName?: string; }`
- **Properties**:
    - It includes all key-value pairs from your defined variant (e.g., if your variant is `{ environment: "production", theme: "dark" }`, then `options.environment` will be `"production"` and `options.theme` will be `"dark"`).
    - `ccwpName?: string` (optional): A string representing the generated unique name for the current variant combination (e.g., "production-dark"). This is very useful for creating unique output paths, filenames, or for logging.

### `Variant`

The base type for an object representing a single variant's key-value pairs.

- **Type**: `{ [key: string]: string | number; }`
    - Indicates an object where keys are strings, and values can be strings or numbers, derived from your `.concurrentWPVariants.json` definitions.

### `WebpackConfig`

Represents a standard Webpack configuration object.

- **Type**: `{ [key: string]: any; }`
- Refer to the [official Webpack documentation](https://webpack.js.org/configuration/) for details on its structure and available options.

```

```
