import { AnyObjective, AnyObjectiveProcessingState } from '@quests/types';
import { AnyReward } from '@rewards/types';

export interface QuestDto {
  id: string;
  objective: AnyObjective;
  objectiveTags: string[];
  category: string;
  group: string;
  title: string;
  description: string;
  order: number;
  imageUrl: string;
  rewards: AnyReward[];
  endsAt: Date;
}

export interface QuestProgressDto {
  status: string;
  objectiveProgressState: AnyObjectiveProcessingState | null;
  moderationEndDate?: Date;
}

export interface UserQuestDto extends QuestDto {
  progressState: QuestProgressDto | null;
}
