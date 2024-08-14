import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { GameCardRarity, GameCardId } from '@card/enums';

export type GameCardDocument = HydratedDocument<GameCard>;

@Schema({ collection: 'game_cards', _id: false })
export class GameCard {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  _id: GameCardId;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  name: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  rarity: GameCardRarity;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  description: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  price: number;
}

export const GameCardSchema = SchemaFactory.createForClass(GameCard);
