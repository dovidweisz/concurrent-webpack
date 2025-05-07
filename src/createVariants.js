export function createVariants(variantsSettings) {
  return Object.entries(variantsSettings).reduce(
    (prev, [key, values]) => {
      return prev.reduce((prev2, curr) => {
        return [
          ...prev2,
          ...values.map((value) => ({
            [key]: value,
            ...curr,
          })),
        ];
      }, []);
    },
    [{}]
  );
}
