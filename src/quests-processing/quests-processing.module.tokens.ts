const QuestsProcessingModuleTokens = {
  ObjectiveProcessors: Symbol('ObjectiveProcessors'),
  ObjectiveTagsExtractors: Symbol('ObjectiveTagsExtractors'),
  Catalogs: {
    QuestsCatalog: Symbol('QuestsCatalog'),
  },
  Factories: {
    ObjectiveProcessorFactory: Symbol('ObjectiveProcessorFactory'),
    ObjectiveTagsExtractorFactory: Symbol('ObjectiveTagsExtractorFactory'),
  },
  Services: {
    QuestsObjectiveProcessingService: Symbol('QuestsObjectiveProcessingService'),
    DetectedQuestActionsProcessingService: Symbol('DetectedQuestActionsProcessingService'),
    QuestService: Symbol('QuestService'),
  },
};

export default QuestsProcessingModuleTokens;
