import { Inject } from '@nestjs/common';
import { getSqsClientToken } from '@sqs/utils';

const InjectSqsClientDecorator = (clientName?: string) => {
  return Inject(getSqsClientToken(clientName));
};

export default InjectSqsClientDecorator;
