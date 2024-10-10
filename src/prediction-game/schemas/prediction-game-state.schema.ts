import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PredictionGameStateDocument = HydratedDocument<PredictionGameState>;

@Schema({ collection: 'prediction_game_states' })
export class PredictionGameState {
  lastProcessedRound: number;
}

export const PredictionGameStateSchema = SchemaFactory.createForClass(PredictionGameState);
