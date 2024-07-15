import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '@user/schemas';
import { PortfolioOffer } from '@portfolio/schemas';
import { BattlePlayer } from '@app/battle/entities/battle.entity';

@Schema()
export class Battle {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  displayId: string;

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
  staticPrizePool: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  entryPrice: number;

  @Prop([{ required: true, type: mongoose.Schema.Types.Mixed }])
  players: BattlePlayer[];
}

export const BattleSchema = SchemaFactory.createForClass(Battle);

BattleSchema.index({ displayId: 1 }, { unique: true });
