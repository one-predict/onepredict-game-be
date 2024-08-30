const CoinModuleTokens = {
  Services: {
    TokensOfferService: Symbol('TokensOfferService'),
    CoinsPricingService: Symbol('CoinsPricingService'),
  },
  Repositories: {
    TokensOfferRepository: Symbol('TokensOfferRepository'),
    CoinsPricingRecordRepository: Symbol('CoinsPricingRecordRepository'),
  },
  Api: {
    CoinsApi: Symbol('CoinsApi'),
  },
};

export default CoinModuleTokens;
