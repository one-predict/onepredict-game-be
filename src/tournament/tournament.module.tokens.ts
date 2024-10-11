const TournamentModuleTokens = {
  Services: {
    TournamentService: Symbol('TournamentService'),
    TournamentParticipationService: Symbol('TournamentParticipationService'),
    TournamentQuestActionsDetectionService: Symbol('TournamentQuestActionsDetectionService'),
  },
  Repositories: {
    TournamentRepository: Symbol('TournamentRepository'),
    TournamentParticipationRepository: Symbol('TournamentParticipationRepository'),
  },
};

export default TournamentModuleTokens;
