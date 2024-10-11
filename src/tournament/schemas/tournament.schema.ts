import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Tournament {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  title: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  description: string;

  @Prop({ required: false, type: mongoose.Schema.Types.String })
  imageUrl?: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  entryPrice: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  staticPrizePool: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  participantsCount: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  startTimestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  endTimestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  joinCloseTimestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  roundDurationInSeconds: number;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

TournamentSchema.index({ startTimestamp: 1, endTimestamp: 1 });
