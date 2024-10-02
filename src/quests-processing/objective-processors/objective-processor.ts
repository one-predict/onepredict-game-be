import { BaseQuestObjective } from '@quests/types';
import { QuestObjectiveType } from '@quests/enums';

export interface ObjectiveProcessor<State, Action, Objective extends BaseQuestObjective<QuestObjectiveType>> {
  process(
    state: State | null,
    action: Action,
    objective: Objective,
  ): Promise<{
    completed: boolean;
    nextState?: State;
  }>;
}
