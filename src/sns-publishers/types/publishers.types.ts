export interface SnsPublisherConfig {
  topicArn: string;
}

export type SnsPublishersConfig = Record<string, SnsPublisherConfig>;
