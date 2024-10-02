import { ObjectId } from 'mongodb';
import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestProgressStatus } from '@quests/enums';
import { AnyObjectiveProcessingState } from '@quests/types';

export type QuestProgressStateDocument = HydratedDocument<QuestProgressState>;

@Schema({ collection: 'quest_progress_states', minimize: false })
export class QuestProgressState {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  quest: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  owner: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.String, enum: Object.values(QuestProgressStatus) })
  status: QuestProgressStatus;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed, default: null })
  objectiveProgressState: AnyObjectiveProcessingState | null;

  @Prop({ required: false, type: mongoose.Schema.Types.Date })
  moderationEndDate?: Date;
}

export const QuestProgressStateSchema = SchemaFactory.createForClass(QuestProgressState);

QuestProgressStateSchema.index({ quest: 1, owner: 1 }, { unique: true });
