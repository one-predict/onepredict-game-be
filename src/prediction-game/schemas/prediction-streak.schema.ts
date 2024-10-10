import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PredictionStreakDocument = HydratedDocument<PredictionStreak>;

@Schema({ timestamps: true, collection: 'user_prediction_streaks' })
export class PredictionStreak {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;

  @Prop({ required: false, default: {}, type: mongoose.Schema.Types.Mixed })
  assetStreaks: Record<string, number>;

  @Prop({ required: false, default: 0, type: mongoose.Schema.Types.Number })
  choicesStreak: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  currentSequence: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Date })
  createdAt: Date;

  @Prop({ required: false, type: mongoose.Schema.Types.Date })
  updatedAt: Date;
}

export const PredictionStreakSchema = SchemaFactory.createForClass(PredictionStreak);

PredictionStreakSchema.index({ user: 1 }, { unique: true });
PredictionStreakSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }); // 7 days
