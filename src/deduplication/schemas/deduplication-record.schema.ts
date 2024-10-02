import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'deduplication_records' })
export class DeduplicationRecord {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  _id: string;

  @Prop({ required: false, type: mongoose.Schema.Types.Date })
  createdAt: Date;
}

export const DeduplicationRecordSchema = SchemaFactory.createForClass(DeduplicationRecord);

DeduplicationRecordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 }); // 1 hour
