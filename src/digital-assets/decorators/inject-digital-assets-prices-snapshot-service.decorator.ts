import { Inject } from '@nestjs/common';
import DigitalAssetsModuleTokens from '@digital-assets/digital-assets.module.tokens';

const InjectDigitalAssetsPricesSnapshotService = () => {
  return Inject(DigitalAssetsModuleTokens.Services.DigitalAssetsPricesSnapshotService);
};

export default InjectDigitalAssetsPricesSnapshotService;
