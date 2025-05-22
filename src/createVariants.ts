export type VariantValue = string | number;

export interface VariantsSettings {
	[key: string]: VariantValue[];
}

export interface Variant {
	[key: string]: VariantValue;
}

export function createVariants(variantsSettings: VariantsSettings): Variant[] {
	return Object.entries(variantsSettings).reduce(
		(prev: Variant[], [key, values]: [string, VariantValue[]]) => {
			return prev.reduce((prev2: Variant[], curr: Variant) => {
				return [
					...prev2,
					...values.map((value: VariantValue) => ({
						[key]: value,
						...curr,
					})),
				];
			}, [] as Variant[]);
		},
		[{}] as Variant[]
	);
}
