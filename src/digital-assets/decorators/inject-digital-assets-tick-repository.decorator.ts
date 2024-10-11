import { Inject } from '@nestjs/common';
import DigitalAssetsModuleTokens from '@digital-assets/digital-assets.module.tokens';

const InjectDigitalAssetsTickRepository = () => {
  return Inject(DigitalAssetsModuleTokens.Repositories.DigitalAssetsTickRepository);
};

export default InjectDigitalAssetsTickRepository;
