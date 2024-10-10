import { Inject } from '@nestjs/common';
import DigitalAssetsModuleTokens from '@digital-assets/digital-assets.module.tokens';

const InjectDigitalAssetsPricesSnapshotEntityMapper = () => {
  return Inject(DigitalAssetsModuleTokens.EntityMapper.DigitalAssetsPricesSnapshotEntityMapper);
};

export default InjectDigitalAssetsPricesSnapshotEntityMapper;
