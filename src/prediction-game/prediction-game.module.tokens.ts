const PredictionGameModuleTokens = {
  Services: {
    PredictionChoiceService: Symbol('PredictionChoiceService'),
    PredictionGameRoundService: Symbol('PredictionGameRoundService'),
    PredictionStreakService: Symbol('PredictionStreakService'),
  },
  Repositories: {
    PredictionChoiceRepository: Symbol('PredictionChoiceRepository'),
    PredictionStreakRepository: Symbol('PredictionStreakRepository'),
    PredictionGameStateRepository: Symbol('PredictionGameStateRepository'),
  },
  EntityToDtoMappers: {
    PredictionChoiceEntityToDtoMapper: Symbol('PredictionChoiceEntityToDtoMapper'),
    PredictionStreakEntityToDtoMapper: Symbol('PredictionStreakEntityToDtoMapper'),
  },
  Strategies: {
    PredictionGameCoinsCalculationStrategy: Symbol('PredictionGameCoinsCalculationStrategy'),
  },
};

export default PredictionGameModuleTokens;
