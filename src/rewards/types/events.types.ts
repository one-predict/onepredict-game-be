import { Event } from '@events/types';
import { AnyReward } from '@rewards/types';

export interface RewardsIssuedEventData {
  userId: string;
  rewards: AnyReward[];
}

export type RewardsIssuedEvent = Event<string, RewardsIssuedEventData>;
