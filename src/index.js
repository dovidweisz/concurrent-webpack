import { createVariants } from "./createVariants.js";
import { getVariantSettings } from "./getVariantSettings.js";

export async function createVariantConfig(configCB) {
  if (process.env.__CCWP_BUILD_OPTIONS) {
    const optionsParams = new URLSearchParams(process.env.__CCWP_BUILD_OPTIONS);
    const options = [...optionsParams.entries()].reduce(
      (obj, [key, value]) => ({
        ...obj,
        [key]: value,
      }),
      {}
    );
    console.log(options);
    debugger;
    return configCB(options);
  }
  return createVariants(await getVariantSettings()).map(configCB);
}
