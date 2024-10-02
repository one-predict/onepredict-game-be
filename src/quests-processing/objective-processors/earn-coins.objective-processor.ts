import { Injectable } from '@nestjs/common';
import { CoinsEarnedQuestAction, EarnCoinsObjective, EarnCoinsObjectiveProcessingState } from '@quests/types';
import { ObjectiveProcessor } from './objective-processor';

@Injectable()
export default class EarnCoinsObjectiveProcessor
  implements ObjectiveProcessor<EarnCoinsObjectiveProcessingState, CoinsEarnedQuestAction, EarnCoinsObjective>
{
  public async process(
    state: EarnCoinsObjectiveProcessingState | null,
    action: CoinsEarnedQuestAction,
    objective: EarnCoinsObjective,
  ) {
    const updatedAmount = state ? state.amount + action.amount : action.amount;

    return {
      completed: updatedAmount >= objective.config.amount,
      nextState: {
        amount: updatedAmount >= objective.config.amount ? objective.config.amount : updatedAmount,
      },
    };
  }
}
