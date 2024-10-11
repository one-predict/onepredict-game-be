import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { getCurrentUnixTimestamp } from '@common/utils';
import { InjectUserService, UserService } from '@user';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { EventsService } from '@events/services';
import { InjectEventsService } from '@events/decorators';
import { InjectTournamentParticipationRepository, InjectTournamentService } from '@tournament/decorators';
import { TournamentLeaderboard, TournamentParticipationRepository } from '@tournament/repositories';
import { TournamentService } from '@tournament/services';
import { TournamentParticipationEntity } from '@tournament/entities';
import { TournamentParticipationsEventType, TournamentsEventCategory } from '@tournament/enums';
import { TournamentParticipationCreatedEventData } from '@tournament/types';

export interface CreateTournamentParticipationParams {
  tournamentId: string;
  userId: string;
}

export interface CreateTournamentParticipationParams {
  userId: string;
  tournamentId: string;
}

export interface TournamentParticipationService {
  create(params: CreateTournamentParticipationParams): Promise<void>;
  getUserRankForTournament(userId: string, tournamentId: string): Promise<number>;
  getUserParticipationInTournament(userId: string, tournamentId: string): Promise<TournamentParticipationEntity | null>;
  getLeaderboard(tournamentId: string): Promise<TournamentLeaderboard>;
  addPoints(userId: string, tournamentId: string, points: number): Promise<void>;
}

@Injectable()
export class TournamentParticipationServiceImpl implements TournamentParticipationService {
  constructor(
    @InjectTournamentParticipationRepository()
    private readonly tournamentParticipationRepository: TournamentParticipationRepository,
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectUserService() private readonly userService: UserService,
    @InjectEventsService() private readonly eventsService: EventsService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async getUserParticipationInTournament(userId: string, tournamentId: string) {
    const [tournamentParticipation] = await this.tournamentParticipationRepository.find({
      filter: {
        userId,
        tournamentId,
      },
      limit: 1,
    });

    return tournamentParticipation ?? null;
  }

  public async create(params: CreateTournamentParticipationParams) {
    await this.transactionsManager.useTransaction(async () => {
      const tournament = await this.tournamentService.getById(params.tournamentId);

      if (!tournament) {
        throw new UnprocessableEntityException(`Provided tournament doesn't exist.`);
      }

      const currentTimestamp = getCurrentUnixTimestamp();

      if (currentTimestamp < tournament.getStartTimestamp() || currentTimestamp > tournament.getJoinCloseTimestamp()) {
        throw new UnprocessableEntityException('Tournament is not available for participation.');
      }

      const existingParticipation = await this.getUserParticipationInTournament(params.userId, params.tournamentId);

      if (existingParticipation) {
        throw new UnprocessableEntityException('User already participated in the tournament.');
      }

      await this.userService.withdrawCoins(params.userId, tournament.getEntryPrice());
      await this.tournamentService.addParticipant(params.tournamentId);

      const tournamentParticipation = await this.tournamentParticipationRepository.create({
        tournament: params.tournamentId,
        user: params.userId,
        points: 0,
      });

      await this.eventsService.create<TournamentParticipationCreatedEventData>({
        userId: params.userId,
        category: TournamentsEventCategory.Tournaments,
        type: TournamentParticipationsEventType.TournamentParticipationCreated,
        data: {
          object: {
            id: tournamentParticipation.getId(),
            tournamentId: tournamentParticipation.getTournamentId(),
            userId: tournamentParticipation.getUserId(),
            points: tournamentParticipation.getPoints(),
          },
        },
        meta: {
          tournamentPrice: tournament.getEntryPrice(),
        },
      });
    });
  }

  public getLeaderboard(tournamentId: string) {
    return this.tournamentParticipationRepository.getLeaderboard(tournamentId);
  }

  public async getUserRankForTournament(userId: string, tournamentId: string) {
    return this.tournamentParticipationRepository.getRank(tournamentId, userId);
  }

  public async addPoints(userId: string, tournamentId: string, points: number) {
    await this.tournamentParticipationRepository.addPoints(userId, tournamentId, points);
  }
}
