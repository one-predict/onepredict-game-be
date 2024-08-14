import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

@Schema({ collection: 'tournament_participations' })
export class TournamentParticipation {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  tournament: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  points: number;
}

export const TournamentParticipationSchema = SchemaFactory.createForClass(TournamentParticipation);

TournamentParticipationSchema.index({ user: 1, tournament: 1 }, { unique: true });
