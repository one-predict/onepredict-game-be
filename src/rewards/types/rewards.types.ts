import { RewardType } from '@rewards/enums';

export interface CoinsReward {
  type: RewardType.Coins;
  coins: number;
}

export type AnyReward = CoinsReward;
