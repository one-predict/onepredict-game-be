import { Controller, UseGuards, Body, Post } from '@nestjs/common';
import { PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { InjectTournamentService } from '@tournament/decorators';
import { TournamentService } from '@tournament/services';
import { GetTournamentByDisplayIdDto } from '@tournament/dto';
import { TournamentEntity } from '@tournament/entities';

@Controller()
export default class TournamentController {
  constructor(@InjectTournamentService() private readonly tournamentService: TournamentService) {}

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
}
