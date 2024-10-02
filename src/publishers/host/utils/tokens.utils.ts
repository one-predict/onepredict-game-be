const MESSAGE_PUBLISHER_SERVICE_TOKEN = '__HOST_PUBLISHER_SERVICE_TOKEN';

export const getMessagePublisherServiceToken = (publisherName: string = '') =>
  `${MESSAGE_PUBLISHER_SERVICE_TOKEN}_${publisherName}`;
