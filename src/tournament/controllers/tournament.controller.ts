import {Controller, UseGuards, Body, Post, Get, Param, Query, NotFoundException, Session} from '@nestjs/common';
import {AuthGuard, PrivateApiAuthorizationTokenGuard} from '@common/guards';
import { InjectTournamentService, InjectTournamentParticipationService } from '@tournament/decorators';
import { TournamentParticipationService, TournamentService } from '@tournament/services';
import { GetTournamentByDisplayIdDto } from '@tournament/dto';
import { TournamentEntity, TournamentParticipationEntity } from '@tournament/entities';
import * as secureSession from "@fastify/secure-session";

@Controller()
export default class TournamentController {
  constructor(
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectTournamentParticipationService() private readonly tournamentParticipationService: TournamentParticipationService,
  ) {}

  @Get('/tournaments/latest')
  @UseGuards(AuthGuard)
  public async getLatestTournaments() {
    const latestTournaments = await this.tournamentService.listLatest();

    return latestTournaments.map((tournament) => this.mapTournamentEntityToViewModel(tournament));
  }

  @Get('/tournaments/:identifier')
  @UseGuards(AuthGuard)
  public async getTournament(
    @Param('identifier') identifier: string,
    @Query('identifierType') identifierType: string,
  ) {
    const tournament = identifierType === 'displayId'
      ? await this.tournamentService.getByDisplayId(Number(identifier))
      : await this.tournamentService.getById(identifier);

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return this.mapTournamentEntityToViewModel(tournament);
  }

  @Get('/tournaments/:id/participation/rank')
  @UseGuards(AuthGuard)
  public async getUserRankInTournament(
    @Session() session: secureSession.Session,
    @Param('id') tournamentId: string,
  ) {
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
    const participation = await this.tournamentParticipationService.getUserParticipationForTournament(
      session.get('userId'),
      tournamentId,
    );

    return { participation: participation && this.mapTournamentParticipationEntityToViewModel(participation) };
  }

  @Get('/tournaments/:id/leaderboard')
  @UseGuards(AuthGuard)
  public async getTournamentLeaderboard(
    @Param('id') tournamentId: string,
  ) {
    return this.tournamentParticipationService.getLeaderboard(tournamentId);
  }

  @Post('/tournaments/:id/participation')
  @UseGuards(AuthGuard)
  public async joinTournament(
    @Session() session: secureSession.Session,
    @Param('id') tournamentId: string,
  ) {
    await this.tournamentParticipationService.create({
      tournamentId,
      userId: session.get('userId'),
    });

    return { success: true };
  }

  // GRPC Style
  @Post('/tournaments/getTournamentByDisplayId')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getTournamentByDisplayId(@Body() body: GetTournamentByDisplayIdDto) {
    const tournament = await this.tournamentService.getByDisplayId(body.tournamentDisplayId);

    return {
      tournament: tournament && this.mapTournamentEntityToViewModel(tournament),
    };
  }

  private mapTournamentEntityToViewModel(tournament: TournamentEntity) {
    return {
      id: tournament.getId(),
      title: tournament.getTitle(),
      description: tournament.getDescription(),
      displayId: tournament.getDisplayId(),
      entryPrice: tournament.getEntryPrice(),
      staticPrizePool: tournament.getStaticPrizePool(),
      participantsCount: tournament.getParticipantsCount(),
      startDay: tournament.getStartDay(),
      endDay: tournament.getEndDay(),
    };
  }

  private mapTournamentParticipationEntityToViewModel(
    tournamentParticipation: TournamentParticipationEntity,
  ) {
    return {
      id: tournamentParticipation.getId(),
      userId: tournamentParticipation.getUserId(),
      tournamentId: tournamentParticipation.getTournamentId(),
      points: tournamentParticipation.getPoints(),
    };
  }
}
