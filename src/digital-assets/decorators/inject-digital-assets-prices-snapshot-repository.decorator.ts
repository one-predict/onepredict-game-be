import { Inject } from '@nestjs/common';
import DigitalAssetsModuleTokens from '@digital-assets/digital-assets.module.tokens';

const InjectDigitalAssetsPricesSnapshotRepository = () => {
  return Inject(DigitalAssetsModuleTokens.Repositories.DigitalAssetsPricesSnapshotRepository);
};

export default InjectDigitalAssetsPricesSnapshotRepository;
