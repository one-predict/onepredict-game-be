import { Injectable } from '@nestjs/common';
import { AnyObjective, AnyObjectiveProcessingState, AnyQuestAction } from '@quests/types';
import { QuestObjectiveType } from '@quests/enums';
import { ObjectiveProcessor } from '@quests-processing/objective-processors';
import { InjectObjectiveProcessors } from '@quests-processing/decorators';

export interface ObjectiveProcessorFactory {
  createProcessor(
    type: QuestObjectiveType,
  ): ObjectiveProcessor<AnyObjectiveProcessingState, AnyQuestAction, AnyObjective>;
}

@Injectable()
export class DefaultObjectiveProcessorsFactory implements ObjectiveProcessorFactory {
  constructor(
    @InjectObjectiveProcessors()
    private readonly processors: Map<
      QuestObjectiveType,
      ObjectiveProcessor<AnyObjectiveProcessingState, AnyQuestAction, AnyObjective>
    >,
  ) {}

  public createProcessor(type: QuestObjectiveType) {
    const processor = this.processors.get(type);

    if (!processor) {
      throw new Error(`No processor registered for objective type: ${type}`);
    }

    return processor;
  }
}
