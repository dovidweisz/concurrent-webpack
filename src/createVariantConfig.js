import { createVariants } from "./createVariants";
import { getVariantSettings } from "./getVariantSettings";

export function createVariantConfig(configCB) {
  if (process.env.__CCWP_BUILD_OPTIONS) {
    const options = new URLSearchParams(process.env.__CCWP_BUILD_OPTIONS);
    return configCB(options);
  }
  return createVariants(getVariantSettings()).map(configCB);
}
