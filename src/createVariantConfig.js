import { createVariants } from "./createVariants.js";
import { getVariantSettings } from "./getVariantSettings.js";

export function createVariantConfig(configCB) {
  if (process.env.__CCWP_BUILD_OPTIONS) {
    const optionsParams = new URLSearchParams(process.env.__CCWP_BUILD_OPTIONS);
    const options = Object.fromEntries(optionsParams);
    return configCB(options);
  }
  return createVariants(getVariantSettings()).map(configCB);
}
