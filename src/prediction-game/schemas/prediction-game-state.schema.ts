import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PredictionGameStateDocument = HydratedDocument<PredictionGameState>;

@Schema({ collection: 'prediction_game_states' })
export class PredictionGameState {
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  lastProcessedRound: number;
}

export const PredictionGameStateSchema = SchemaFactory.createForClass(PredictionGameState);
