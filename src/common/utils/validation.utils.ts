const IDENTIFIER_REGEX = /^[a-fA-F0-9]{24}$/;

export const isIdentifier = (value: unknown) => {
  return typeof value === 'string' && IDENTIFIER_REGEX.test(value);
};
