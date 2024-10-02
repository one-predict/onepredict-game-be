import { ConsumerOptions, StopOptions } from 'sqs-consumer';

export type ConsumersConfig = Array<
  {
    name: string;
    stopOptions?: StopOptions;
  } & Omit<ConsumerOptions, 'handleMessage' | 'handleMessageBatch'>
>;
