import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '@user/schemas';
import { PortfolioOffer } from '@portfolio/schemas';

@Schema()
export class Battle {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  battleId: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  ownerId: ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: PortfolioOffer.name,
  })
  offerId: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  entryPrice: number;

  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  participants: string[];
}

export const BattleSchema = SchemaFactory.createForClass(Battle);

BattleSchema.index({ owner: 1, offer: 1 }, { unique: true });
