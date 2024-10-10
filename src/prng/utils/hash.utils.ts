export const hashString = (str: string): number => {
  let hash = 0;

  for (let index = 0; index < str.length; index++) {
    const char = str.charCodeAt(index);

    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  return hash;
};
