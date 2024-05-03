export interface MatchRangeOptions {
  strictFrom?: boolean;
  strictTo?: boolean;
}

const MatchRange = <Type>(from?: Type, to?: Type, options?: MatchRangeOptions) => {
  const fromOperator = options?.strictFrom ? '$gt' : '$gte';
  const toOperator = options?.strictTo ? '$lt' : '$lte';

  const fromMatch = from !== undefined && from !== null ? { [fromOperator]: from } : {};

  const toMatch = to !== undefined && from !== null ? { [toOperator]: to } : {};

  return {
    ...fromMatch,
    ...toMatch,
  };
};

export default MatchRange;
