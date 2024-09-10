const CoinModuleTokens = {
  Services: {
    CoinsHistoryService: Symbol('CoinsHistoryService'),
    CoinsPricingService: Symbol('CoinsPricingService'),
  },
  Repositories: {
    CoinsHistoricalRecordRepository: Symbol('CoinsHistoricalRecordRepository'),
    CoinsPricingInfoRepository: Symbol('CoinsPricingInfoRepository'),
  },
  Api: {
    CoinsApi: Symbol('CoinsApi'),
  },
};

export default CoinModuleTokens;
