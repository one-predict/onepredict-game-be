const QuestsModuleTokens = {
  Services: {
    QuestService: Symbol('QuestService'),
    QuestProgressService: Symbol('QuestProgressStateService'),
    QuestRewardsService: Symbol('QuestRewardsService'),
    QuestVerificationService: Symbol('QuestVerificationService'),
  },
  Repositories: {
    QuestRepository: Symbol('QuestRepository'),
    QuestProgressStateRepository: Symbol('QuestProgressStateRepository'),
  },
  EntityToDtoMappers: {
    QuestEntityToDtoMapper: Symbol('QuestEntityToDtoMapper'),
    QuestProgressStateEntityToDtoMapper: Symbol('QuestProgressStateEntityToDtoMapper'),
  },
};

export default QuestsModuleTokens;
