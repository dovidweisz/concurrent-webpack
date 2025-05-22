#!/usr/bin/env node
// import minimist from "minimist"; // Original script has this commented out
import concurrently, { ConcurrentlyCommandInput } from "concurrently";
import { getVariantSettings } from "../src/getVariantSettings"; // Adjusted path, assuming VariantsSettings export
import { createVariants, Variant, VariantsSettings } from "../src/createVariants"; // Adjusted path
import { URLSearchParams } from "url";


interface SettingItem {
  options: URLSearchParams;
  name: string;
}

async function main() {

    const  argv= process.argv.splice(2);

  // const args = minimist(argv); // Original script has this commented out
  // console.log(args);

  const variantSettings: VariantsSettings = await getVariantSettings();

  const variants: Variant[] = createVariants(variantSettings);


  const settings: SettingItem[] = variants.map((variant: Variant) => {
    const name: string = Object.values(variant).join("-");
    // Ensure all values in `variant` are strings for URLSearchParams
    const stringifiedVariant: Record<string, string> = {};
    for (const key in variant) {
      stringifiedVariant[key] = String(variant[key]);
    }
    return {
      options: new URLSearchParams({
        ccwpName: name,
        ...stringifiedVariant,
      }),
      name,
    };
  });

  const longestNameLength: number = settings.reduce(
    (length: number, { name }: SettingItem) => Math.max(length, name.length),
    0
  );

  // Define a more specific type for what concurrently's result items look like
  interface ConcurrentlySuccessItem {
    command: {
      name: string;
      command: string;
      env: Record<string, any>;
      index: number;
      pid?: number;
      killed?: boolean;
      exitCode?: number;
    };
    index: number;
    killed: boolean;
    pid?: number;
    exitCode: number;
    timings: {
      startDate: Date;
      endDate: Date;
      durationSeconds: number;
    };
  }


  const { result } = concurrently(
    settings.map(({ options, name }: SettingItem): ConcurrentlyCommandInput => ({
      command: `webpack ${argv.join(" ")}`, // argv here is from process.argv
      name: name.padEnd(longestNameLength, " "),
      env: {
        __CCWP_BUILD_OPTIONS: options.toString(),
        CCWP_BUILD_NAME: name,
      },
    })),
    {
      killOthers: "failure",
    }
  );

  result.then(
    (closeEvents) => {
      if (closeEvents.some((event) => (event as any).killed)) {
        console.error("Parallel Build Killed!");
        process.exit(1);
      }
      console.log("Parallel Build Successfully completed!");
      process.exit(0);
    },
    (error: any) => {
      console.error("Parallel Build Failed!", error);
      process.exit(1);
    }
  );
}
main();
