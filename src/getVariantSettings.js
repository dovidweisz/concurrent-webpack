import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function getVariantSettings() {
  const rawJSON = await readFile(
    resolve(".", ".concurrentWPVariants.json"),
    "utf8"
  );
  return JSON.parse(rawJSON);
}
