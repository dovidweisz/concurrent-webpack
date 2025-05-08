#!/usr/bin/env node
// import minimist from "minimist";
import concurrently from "concurrently";
import { getVariantSettings } from "../src/getVariantSettings.js";
import { createVariants } from "../src/createVariants.js";

const [_ich, _saa, ...argv] = process.argv;

// const args = minimist(argv);
// console.log(args);

const variantSettings = await getVariantSettings();

const variants = createVariants(variantSettings);

const settings = variants.map((variant) => {
  const name = Object.values(variant).join("-");
  return {
    options: new URLSearchParams({
      ccwpName: name,
      ...variant,
    }),

    name,
  };
});

const longestNameLength = settings.reduce(
  (length, { name }) => Math.max(length, name.length),
  0
);

function padName(name) {
  const padLength = longestNameLength - name.length;
  return `${name}${Array.prototype.join.call({ length: padLength + 1 }, " ")}`;
}

const { result } = concurrently(
  settings.map(({ options, name }) => ({
    command: `webpack ${argv.join(" ")}`,
    name: padName(name),
    env: {
      __CCWP_BUILD_OPTIONS: options,
      CCWP_BUILD_NAME: name,
    },
  })),
  {
    killOthers: "failure",
  }
);

result.then(
  (successItems) => {
    if (successItems.some((item) => item.killed)) {
      console.error("Parallel Build Killed!");
      process.exit(1);
    }
    console.log("Parallel Build Successfully completed!");
    process.exit(0);
  },
  (error) => {
    console.error("Parallel Build Failed!", error);
    process.exit(1);
  }
);
