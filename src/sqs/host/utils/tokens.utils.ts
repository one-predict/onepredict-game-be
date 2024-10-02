const SQS_CLIENT_TOKEN = '__HOST_SQS_CLIENT_TOKEN';

export const getSqsClientToken = (clientName: string = '') => `${SQS_CLIENT_TOKEN}_${clientName}`;
