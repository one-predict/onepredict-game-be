import { Inject } from '@nestjs/common';
import { getMessagePublisherServiceToken } from '@publishers/utils';

const InjectMessagePublisherService = (publisherName?: string) => {
  return Inject(getMessagePublisherServiceToken(publisherName));
};

export default InjectMessagePublisherService;
