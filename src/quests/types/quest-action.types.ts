import { QuestActionType } from '@quests/enums';

export interface CoinsEarnedQuestAction {
  type: QuestActionType.CoinsEarned;
  amount: number;
}

export interface TournamentJoinedQuestAction {
  type: QuestActionType.TournamentJoined;
  tournamentId: string;
}

export type AnyQuestAction = CoinsEarnedQuestAction | TournamentJoinedQuestAction;
