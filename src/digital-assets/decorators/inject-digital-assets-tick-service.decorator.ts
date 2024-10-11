import { Inject } from '@nestjs/common';
import DigitalAssetsModuleTokens from '@digital-assets/digital-assets.module.tokens';

const InjectDigitalAssetsTickService = () => {
  return Inject(DigitalAssetsModuleTokens.Services.DigitalAssetsTickService);
};

export default InjectDigitalAssetsTickService;
