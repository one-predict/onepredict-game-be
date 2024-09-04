import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TournamentDeckDocument = HydratedDocument<TournamentDeck>;

@Schema({ collection: 'tournament_decks', minimize: false })
export class TournamentDeck {
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  totalDeckSize: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  cardsStack: Record<string, number>;

  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  usedCardsStackByRound: Record<number, Record<string, number>>;

  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  allUsedCardsStack: Record<string, number>;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  tournament: ObjectId;
}

export const TournamentDeckSchema = SchemaFactory.createForClass(TournamentDeck);

TournamentDeckSchema.index({ user: 1, tournament: 1 }, { unique: true });
