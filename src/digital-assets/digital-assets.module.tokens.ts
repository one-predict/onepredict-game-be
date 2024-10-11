const DigitalAssetsModuleTokens = {
  Services: {
    DigitalAssetsPricesSnapshotService: Symbol('DigitalAssetsPricesSnapshotService'),
    DigitalAssetsTickService: Symbol('DigitalAssetsTickService'),
  },
  Repositories: {
    DigitalAssetsPricesSnapshotRepository: Symbol('DigitalAssetsPricesSnapshotRepository'),
    DigitalAssetsTickRepository: Symbol('DigitalAssetsTickRepository'),
  },
  EntityMapper: {
    DigitalAssetsPricesSnapshotEntityMapper: Symbol('DigitalAssetsPricesSnapshotEntityMapper'),
  },
  Api: {
    DigitalAssetsApi: Symbol('DigitalAssetsApi'),
  },
};

export default DigitalAssetsModuleTokens;
