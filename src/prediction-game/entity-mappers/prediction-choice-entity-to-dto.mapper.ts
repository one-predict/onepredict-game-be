import { Injectable } from '@nestjs/common';
import { PredictionChoiceEntity } from '@prediction-game/entities';
import { PredictionChoiceDto } from '@prediction-game/dto';

export interface PredictionChoiceEntityToDtoMapper {
  mapOne(entity: PredictionChoiceEntity): PredictionChoiceDto;
  mapMany(entities: PredictionChoiceEntity[]): PredictionChoiceDto[];
}

@Injectable()
export class DefaultPredictionChoiceEntityToDtoMapper implements PredictionChoiceEntityToDtoMapper {
  public mapOne(entity: PredictionChoiceEntity): PredictionChoiceDto {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      predictions: entity.getPredictions(),
      round: entity.getRound(),
      isAwarded: entity.getIsAwarded(),
      result: entity.getResult(),
    };
  }

  public mapMany(entities: PredictionChoiceEntity[]): PredictionChoiceDto[] {
    return entities.map((entity) => this.mapOne(entity));
  }
}
