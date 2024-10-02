import { Injectable } from '@nestjs/common';
import { QuestEntity } from '@quests/entities';
import { QuestDto } from '@quests/dto';

export interface QuestEntityToDtoMapper {
  mapOne(entity: QuestEntity): QuestDto;
  mapMany(entities: QuestEntity[]): QuestDto[];
}

@Injectable()
export class DefaultQuestEntityToDtoMapper implements QuestEntityToDtoMapper {
  public mapOne(entity: QuestEntity): QuestDto {
    return {
      id: entity.getId(),
      description: entity.getDescription(),
      objective: entity.getObjective(),
      objectiveTags: entity.getObjectiveTags(),
      category: entity.getCategory(),
      group: entity.getGroup(),
      title: entity.getTitle(),
      order: entity.getOrder(),
      imageUrl: entity.getImageUrl(),
      rewards: entity.getRewards(),
      endsAt: entity.getEndsAt(),
    };
  }

  public mapMany(entities: QuestEntity[]): QuestDto[] {
    return entities.map((entity) => this.mapOne(entity));
  }
}
