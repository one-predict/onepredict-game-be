const IdempotencyModuleTokens = {
  Services: {
    IdempotencyService: Symbol('IdempotencyService'),
  },
  Stores: {
    IdempotencyKeysStore: Symbol('IdempotencyKeysStore'),
  },
};

export default IdempotencyModuleTokens;
