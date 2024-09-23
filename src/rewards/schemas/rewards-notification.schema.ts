import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';
import { AnyObject } from '@common/types';

export type RewardsNotificationDocument = HydratedDocument<RewardsNotification>;

@Schema({ timestamps: true, minimize: false, collection: 'rewards_notifications' })
export class RewardsNotification {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  recipient: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  type: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  payload: AnyObject;

  @Prop({ required: false, type: mongoose.Schema.Types.Date })
  createdAt: Date;
}

export const RewardsNotificationSchema = SchemaFactory.createForClass(RewardsNotification);

RewardsNotificationSchema.index({ recipient: 1, createdAt: 1 });
