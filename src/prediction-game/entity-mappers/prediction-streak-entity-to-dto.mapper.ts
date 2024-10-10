import { Injectable } from '@nestjs/common';
import { PredictionStreakEntity } from '@prediction-game/entities';
import { PredictionStreakDto } from '@prediction-game/dto';

export interface PredictionStreakEntityToDtoMapper {
  mapOne(entity: PredictionStreakEntity): PredictionStreakDto;
  mapMany(entities: PredictionStreakEntity[]): PredictionStreakDto[];
}

@Injectable()
export class DefaultPredictionStreakEntityToDtoMapper implements PredictionStreakEntityToDtoMapper {
  public mapOne(entity: PredictionStreakEntity): PredictionStreakDto {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      assetStreaks: entity.getAssetStreaks(),
      choicesStreak: entity.getChoicesStreak(),
      currentSequence: entity.getCurrentSequence(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }

  public mapMany(entities: PredictionStreakEntity[]): PredictionStreakDto[] {
    return entities.map((entity) => this.mapOne(entity));
  }
}
