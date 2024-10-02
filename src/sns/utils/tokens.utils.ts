const SNS_CLIENT_TOKEN = '__SNS_CLIENT_TOKEN';

export const getSnsClientToken = (clientName?: string) => `${SNS_CLIENT_TOKEN}_${clientName}`;
