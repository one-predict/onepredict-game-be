import { Controller, UseGuards, Body, Post, Session } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard, PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { InjectTournamentParticipationService } from '@tournament/decorators';
import { TournamentParticipationService } from '@tournament/services';
import {
  CreateTournamentParticipationForUserDto,
  CreateTournamentParticipationDto,
  GetUserRankForTournamentDto,
  GetUserParticipationForTournamentDto,
} from '@tournament/dto';
import { TournamentParticipationEntity } from '@tournament/entities';

@Controller()
export default class TournamentParticipationController {
  constructor(
    @InjectTournamentParticipationService()
    private readonly tournamentParticipationService: TournamentParticipationService,
  ) {}

  @Post('/tournament-participations')
  @UseGuards(AuthGuard)
  public async create(@Session() session: secureSession.Session, @Body() body: CreateTournamentParticipationDto) {
    await this.tournamentParticipationService.create({
      userId: session.get('userId'),
      tournamentId: body.tournamentId,
    });

    return { success: true };
  }

  // GRPC Style
  @Post('/tournament-participations/getUserParticipationForTournament')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getParticipationForTournament(@Body() body: GetUserParticipationForTournamentDto) {
    const participation = await this.tournamentParticipationService.getUserParticipationForTournament(
      body.userId,
      body.tournamentId,
    );

    return {
      participation: participation && this.mapTournamentParticipationEntityToViewModel(participation),
    };
  }

  // GRPC Style
  @Post('/tournament-participations/createTournamentParticipationForUser')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async createTournamentParticipationForUser(@Body() body: CreateTournamentParticipationForUserDto) {
    await this.tournamentParticipationService.create({
      tournamentId: body.tournamentId,
      userId: body.userId,
    });

    return { success: true };
  }

  // GRPC Style
  @Post('/tournament-participations/getUserRankForTournament')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getUserRankForTournament(@Body() body: GetUserRankForTournamentDto) {
    const rank = await this.tournamentParticipationService.getUserRankForTournament(body.userId, body.tournamentId);

    return { rank };
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
