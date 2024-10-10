import prand, { uniformIntDistribution } from 'pure-rand';
import { hashString } from './hash.utils';

export const generatePseudoRandomNumberWithSeed = (seed: string, min: number, max: number) => {
  const numberSeed = hashString(seed);

  const [result] = uniformIntDistribution(min, max, prand.xoroshiro128plus(numberSeed));

  return result;
};
