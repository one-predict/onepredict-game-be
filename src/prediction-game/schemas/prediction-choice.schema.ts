import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { DigitalAssetPricePrediction } from '@prediction-game/types';
import { PredictionChoiceResult } from '@prediction-game/types';

export type PredictionChoiceDocument = HydratedDocument<PredictionChoice>;

@Schema({ collection: 'prediction_choices' })
export class PredictionChoice {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;

  @Prop([{ required: true, type: mongoose.Schema.Types.Mixed }])
  predictions: DigitalAssetPricePrediction[];

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  round: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  streakSequence: number;

  @Prop({ required: false, default: true, type: mongoose.Schema.Types.Boolean })
  isAwarded: boolean;

  @Prop({ required: false, type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed })
  result?: PredictionChoiceResult;
}

export const PredictionChoiceSchema = SchemaFactory.createForClass(PredictionChoice);

PredictionChoiceSchema.index({ user: 1, round: 1 }, { unique: true });
