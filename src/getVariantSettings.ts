import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { VariantsSettings } from "./createVariants"; // Adjusted path

export async function getVariantSettings(): Promise<VariantsSettings> {
	const rawJSON: string = await readFile(
		resolve(".", ".concurrentWPVariants.json"),
		"utf8"
	);
	// Assuming the JSON structure matches VariantsSettings.
	// A more robust implementation might include validation.
	return JSON.parse(rawJSON) as VariantsSettings;
}
