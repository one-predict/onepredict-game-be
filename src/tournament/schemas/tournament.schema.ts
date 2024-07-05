import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Tournament {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  title: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  description: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  displayId: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  entryPrice: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  staticPrizePool: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  participantsCount: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  startDay: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  endDay: number;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

TournamentSchema.index({ fromDay: 1, tillDay: 1 });
TournamentSchema.index({ displayId: 1 }, { unique: true });
