import { Inject } from '@nestjs/common';
import DigitalAssetsModuleTokens from '@digital-assets/digital-assets.module.tokens';

const InjectDigitalAssetsApi = () => {
  return Inject(DigitalAssetsModuleTokens.Api.DigitalAssetsApi);
};

export default InjectDigitalAssetsApi;
