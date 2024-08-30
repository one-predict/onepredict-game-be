import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { GameCardId } from '@card';

export type TournamentDeckDocument = HydratedDocument<TournamentDeck>;

@Schema({ collection: 'tournament_decks' })
export class TournamentDeck {
  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  cards: GameCardId[];

  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  usedCards: GameCardId[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  tournament: ObjectId;
}

export const TournamentDeckSchema = SchemaFactory.createForClass(TournamentDeck);

TournamentDeckSchema.index({ user: 1 }, { unique: true });
