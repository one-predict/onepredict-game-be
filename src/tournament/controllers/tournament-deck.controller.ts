import { Controller, Session, Get, UseGuards, Body, Put, Param, Query } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { InjectTournamentDeckService } from '@tournament/decorators';
import { ListMyTournamentDecksDto, UpdateTournamentDeckDto } from '@tournament/dto';
import { TournamentDeckService } from '@tournament/services';
import { TournamentDeckEntity } from '@tournament/entities';

@Controller()
export default class TournamentDeckController {
  constructor(@InjectTournamentDeckService() private readonly tournamentDeckService: TournamentDeckService) {
    this.mapTournamentDeckToViewModel = this.mapTournamentDeckToViewModel.bind(this);
  }

  @Get('/tournament-decks/my')
  @UseGuards(AuthGuard)
  public async listMyTournamentDecks(
    @Session() session: secureSession.Session,
    @Query() query: ListMyTournamentDecksDto,
  ) {
    const deck = await this.tournamentDeckService.getUserDeckForTournament(session.get('userId'), query.tournamentId);

    return deck ? [this.mapTournamentDeckToViewModel(deck)] : [];
  }

  @Put('/tournament-decks/:id')
  @UseGuards(AuthGuard)
  public async updateTournamentDeck(
    @Session() session: secureSession.Session,
    @Param('id') deckId: string,
    @Body() body: UpdateTournamentDeckDto,
  ) {
    const tournament = await this.tournamentDeckService.update(deckId, {
      cardsStack: body.cardsStack,
    });

    return this.mapTournamentDeckToViewModel(tournament);
  }

  private mapTournamentDeckToViewModel(deck: TournamentDeckEntity) {
    return {
      id: deck.getId(),
      totalDeckSize: deck.getTotalDeckSize(),
      cardsStack: deck.getCardsStack(),
      usedCardsStackByRound: deck.getUsedCardsStackByRound(),
      allUsedCardsStack: deck.getAllUsedCardsStack(),
      userId: deck.getUserId(),
      tournamentId: deck.getTournamentId(),
    };
  }
}
