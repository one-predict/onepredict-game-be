import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { GameCardId } from '@card';

export type UserInventoryDocument = HydratedDocument<UserInventory>;

const DEFAULT_AVAILABLE_CARD_SLOTS = 3;
const DEFAULT_AVAILABLE_PORTFOLIO_CARD_SLOTS = 1;

@Schema({ collection: 'user_inventories' })
export class UserInventory {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;

  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  cards: GameCardId[];

  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  perks: string[];

  @Prop({ type: mongoose.Schema.Types.Number, default: DEFAULT_AVAILABLE_CARD_SLOTS })
  availableCardSlots: number;

  @Prop({ type: mongoose.Schema.Types.Number, default: DEFAULT_AVAILABLE_PORTFOLIO_CARD_SLOTS })
  availablePortfolioCardSlots: number;
}

export const UserInventorySchema = SchemaFactory.createForClass(UserInventory);
