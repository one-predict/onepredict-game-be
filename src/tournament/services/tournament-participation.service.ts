import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectUserService, UserService } from '@app/user';
import { getCurrentDayInUtc } from '@common/utils';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';
import { InjectTournamentParticipationRepository, InjectTournamentService } from '@tournament/decorators';
import {TournamentLeaderboard, TournamentParticipationRepository} from '@tournament/repositories';
import { TournamentService } from '@tournament/services';
import { TournamentParticipationEntity } from '@tournament/entities';

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
  getUserParticipationForTournament(userId: string, tournamentId: string): Promise<TournamentParticipationEntity>;
  getLeaderboard(tournamentId: string): Promise<TournamentLeaderboard>;
  bulkAddPoints(tournamentIds: string[], userId: string, points: number): Promise<void>;
}

@Injectable()
export class TournamentParticipationServiceImpl implements TournamentParticipationService {
  constructor(
    @InjectTournamentParticipationRepository()
    private readonly tournamentParticipationRepository: TournamentParticipationRepository,
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectUserService() private readonly userService: UserService,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
  ) {}

  public getUserParticipationForTournament(userId: string, tournamentId: string) {
    return this.tournamentParticipationRepository.findByUserIdAndTournamentId(userId, tournamentId);
  }

  public async create(params: CreateTournamentParticipationParams) {
    await this.transactionsManager.useTransaction(async () => {
      const tournament = await this.tournamentService.getById(params.tournamentId);

      if (!tournament) {
        throw new BadRequestException('Provided tournament is not found.');
      }

      const currentDay = getCurrentDayInUtc();

      if (currentDay >= tournament.getEndDay()) {
        throw new UnprocessableEntityException('Tournament is not available for participation.');
      }

      const participationExists = await this.tournamentParticipationRepository.existsByTournamentIdAndUserId(
        params.tournamentId,
        params.userId,
      );

      if (participationExists) {
        throw new BadRequestException('User already participated in the tournament.');
      }

      await this.userService.withdrawCoins(params.userId, tournament.getEntryPrice());
      await this.tournamentService.addParticipant(params.tournamentId);

      await this.tournamentParticipationRepository.create({
        tournament: params.tournamentId,
        user: params.userId,
        points: 0,
      });
    });
  }

  public getLeaderboard(tournamentId: string) {
    return this.tournamentParticipationRepository.getLeaderboard(tournamentId);
  }

  public async getUserRankForTournament(userId: string, tournamentId: string) {
    return this.tournamentParticipationRepository.getRank(tournamentId, userId);
  }

  public async bulkAddPoints(tournamentIds: string[], userId: string, points: number) {
    await this.tournamentParticipationRepository.bulkAddPoints(tournamentIds, userId, points);
  }
}
