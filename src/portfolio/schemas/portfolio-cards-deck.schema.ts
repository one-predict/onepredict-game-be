import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { GameCardId } from '@card';

export type PortfolioCardsDeckDocument = HydratedDocument<PortfolioCardsDeck>;

@Schema({ collection: 'portfolio_cards_decks' })
export class PortfolioCardsDeck {
  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  cards: GameCardId[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;
}

export const PortfolioCardsDeckSchema = SchemaFactory.createForClass(PortfolioCardsDeck);

PortfolioCardsDeckSchema.index({ user: 1 }, { unique: true });
