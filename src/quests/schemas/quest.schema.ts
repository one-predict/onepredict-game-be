import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AnyReward } from '@rewards/types';
import { AnyObjective } from '@quests/types';
import { DEFAULT_QUESTS_GROUP } from '@quests/constants';

export type QuestDocument = HydratedDocument<Quest>;

const QuestObjectiveSchema = new mongoose.Schema(
  {
    type: { type: mongoose.Schema.Types.String, required: true },
    config: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

@Schema({ minimize: false })
export class Quest {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  category: string;

  @Prop({ required: true, type: QuestObjectiveSchema })
  objective: AnyObjective;

  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  objectiveTags: string[];

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  title: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  description: string;

  @Prop([{ required: true, type: mongoose.Schema.Types.Mixed }])
  rewards: AnyReward[];

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  order: number;

  @Prop({ required: false, type: mongoose.Schema.Types.String, default: DEFAULT_QUESTS_GROUP })
  group: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  imageUrl: string;

  @Prop({ required: false, type: mongoose.Schema.Types.Date })
  endsAt: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  hiddenTill: Date;
}

export const QuestSchema = SchemaFactory.createForClass(Quest);

QuestSchema.index({
  objectiveTags: 1,
  endsAt: 1,
});

QuestSchema.index({
  group: 1,
  order: 1,
  hiddenTill: 1,
  endsAt: 1,
});
