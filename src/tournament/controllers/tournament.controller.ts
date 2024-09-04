import { Controller, UseGuards, Post, Get, Param, NotFoundException, Session, Query } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { InjectTournamentService, InjectTournamentParticipationService } from '@tournament/decorators';
import { TournamentParticipationService, TournamentService } from '@tournament/services';
import { TournamentEntity, TournamentParticipationEntity } from '@tournament/entities';
import { ListLatestTournamentsDto } from '@tournament/dto';

@Controller()
export default class TournamentController {
  constructor(
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectTournamentParticipationService()
    private readonly tournamentParticipationService: TournamentParticipationService,
  ) {}

  @Get('/tournaments/latest')
  @UseGuards(AuthGuard)
  public async getLatestTournaments(@Query() query: ListLatestTournamentsDto) {
    const latestTournaments = await this.tournamentService.listLatest(query.status);

    return latestTournaments.map((tournament) => this.mapTournamentEntityToViewModel(tournament));
  }

  @Get('/tournaments/:id')
  @UseGuards(AuthGuard)
  public async getTournament(@Param('id') id: string) {
    const tournament = await this.tournamentService.getById(id);

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return this.mapTournamentEntityToViewModel(tournament);
  }

  @Get('/tournaments/:id/participation/rank')
  @UseGuards(AuthGuard)
  public async getUserRankInTournament(@Session() session: secureSession.Session, @Param('id') tournamentId: string) {
    const rank = await this.tournamentParticipationService.getUserRankForTournament(
      session.get('userId'),
      tournamentId,
    );

    return { rank };
  }

  @Get('/tournaments/:id/participation')
  @UseGuards(AuthGuard)
  public async getUserParticipationInTournament(
    @Session() session: secureSession.Session,
    @Param('id') tournamentId: string,
  ) {
    const participation = await this.tournamentParticipationService.getUserParticipationInTournament(
      session.get('userId'),
      tournamentId,
    );

    return { participation: participation && this.mapTournamentParticipationEntityToViewModel(participation) };
  }

  @Get('/tournaments/:id/leaderboard')
  @UseGuards(AuthGuard)
  public async getTournamentLeaderboard(@Param('id') tournamentId: string) {
    return this.tournamentParticipationService.getLeaderboard(tournamentId);
  }

  @Post('/tournaments/:id/participation')
  @UseGuards(AuthGuard)
  public async joinTournament(@Session() session: secureSession.Session, @Param('id') tournamentId: string) {
    await this.tournamentParticipationService.create({
      tournamentId,
      userId: session.get('userId'),
    });

    return { success: true };
  }

  private mapTournamentEntityToViewModel(tournament: TournamentEntity) {
    return {
      id: tournament.getId(),
      title: tournament.getTitle(),
      description: tournament.getDescription(),
      imageUrl: tournament.getImageUrl(),
      entryPrice: tournament.getEntryPrice(),
      staticPrizePool: tournament.getStaticPrizePool(),
      participantsCount: tournament.getParticipantsCount(),
      startTimestamp: tournament.getStartTimestamp(),
      endTimestamp: tournament.getEndTimestamp(),
      roundDurationInSeconds: tournament.getRoundDurationInSeconds(),
    };
  }

  private mapTournamentParticipationEntityToViewModel(tournamentParticipation: TournamentParticipationEntity) {
    return {
      id: tournamentParticipation.getId(),
      userId: tournamentParticipation.getUserId(),
      tournamentId: tournamentParticipation.getTournamentId(),
      points: tournamentParticipation.getPoints(),
    };
  }
}
