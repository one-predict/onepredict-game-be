import { Injectable } from '@nestjs/common';
import { QuestProgressStateEntity } from '@quests/entities';
import { QuestProgressDto } from '@quests/dto';

export interface QuestProgressStateEntityToDtoMapper {
  mapOne(entity: QuestProgressStateEntity): QuestProgressDto;
  mapMany(entities: QuestProgressStateEntity[]): QuestProgressDto[];
}

@Injectable()
export class DefaultQuestProgressStateEntityToDtoMapper implements QuestProgressStateEntityToDtoMapper {
  public mapOne(entity: QuestProgressStateEntity): QuestProgressDto {
    return {
      status: entity.getStatus(),
      objectiveProgressState: entity.getObjectiveProgressState(),
      moderationEndDate: entity.getModerationEndDate(),
    };
  }

  public mapMany(entities: QuestProgressStateEntity[]): QuestProgressDto[] {
    return entities.map((entity) => this.mapOne(entity));
  }
}
