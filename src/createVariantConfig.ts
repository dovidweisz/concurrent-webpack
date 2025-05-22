import { createVariants, Variant, VariantsSettings } from "./createVariants";
import { getVariantSettings } from "./getVariantSettings";
import { URLSearchParams } from "url";

export interface WebpackConfig {
	[key: string]: any; // A simple Webpack config representation
}

// Options passed to the callback. ccwpName is present if built for a single variant.
// Variant properties might be strings if derived from environment variables via URLSearchParams.
export type ConfigCallbackOptions = Variant & {
	ccwpName?: string;
};

export type ConfigCallback = (options: ConfigCallbackOptions) => WebpackConfig;

export async function createVariantConfig(
	configCB: ConfigCallback
): Promise<WebpackConfig | WebpackConfig[]> {
	if (process.env.__CCWP_BUILD_OPTIONS) {
		const optionsParams = new URLSearchParams(
			process.env.__CCWP_BUILD_OPTIONS as string
		);
		// Object.fromEntries results in Record<string, string>.
		// We cast to ConfigCallbackOptions. This assumes that if configCB expects numbers
		// for some variant properties, it's robust to handle stringified versions,
		// or that relevant properties are used as strings.
		// ccwpName will be present here as a string.
		const optionsFromEnv = Object.fromEntries(optionsParams) as Record<
			string,
			string
		>;
		return configCB(optionsFromEnv as unknown as ConfigCallbackOptions);
	}

	// Assuming getVariantSettings returns VariantsSettings or a compatible type.
	// This might need adjustment once getVariantSettings.ts is typed.
	const variantSettings = (await getVariantSettings()) as VariantsSettings;
	const variants: Variant[] = createVariants(variantSettings);

	// In this path, configCB is called with each Variant.
	// Since ccwpName is optional in ConfigCallbackOptions, this is compatible.
	return variants.map(configCB);
}
