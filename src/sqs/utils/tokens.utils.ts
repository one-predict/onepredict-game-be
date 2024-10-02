const SQS_CLIENT_TOKEN = '__SQS_CLIENT_TOKEN';

export const getSqsClientToken = (clientName: string = '') => `${SQS_CLIENT_TOKEN}_${clientName}`;
