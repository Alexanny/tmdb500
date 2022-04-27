export const objectToSearchParams = (obj: object): string => {
  const params = new URLSearchParams();
  for (let [key, value] of Object.entries(obj)) {
    if (value) {
      params.set(key, value);
    }
  }
  return params.toString();
};
