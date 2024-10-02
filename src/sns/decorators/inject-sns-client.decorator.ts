import { Inject } from '@nestjs/common';
import { getSnsClientToken } from '@sns/utils';

const InjectSnsClientDecorator = (clientName?: string) => {
  return Inject(getSnsClientToken(clientName));
};

export default InjectSnsClientDecorator;
