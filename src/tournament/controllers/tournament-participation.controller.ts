import { Controller, UseGuards, Body, Post, Session } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { InjectTournamentParticipationService } from '@tournament/decorators';
import { TournamentParticipationService } from '@tournament/services';
import { CreateTournamentParticipationDto } from '@tournament/dto';

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
}
