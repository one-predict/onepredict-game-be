const MESSAGE_PUBLISHER_SERVICE_TOKEN = '__PUBLISHER_SERVICE_TOKEN';

export const getMessagePublisherServiceToken = (publisherName: string) =>
  `${MESSAGE_PUBLISHER_SERVICE_TOKEN}_${publisherName}`;
