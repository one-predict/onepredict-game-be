import { Controller, Session, Get, UseGuards, Post, Body, Put, Param } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { InjectPortfolioCardsDeckService } from '@portfolio/decorators';
import { CreatePortfolioCardsDeckDto, UpdatePortfolioCardsDeckDto } from '@portfolio/dto';
import { PortfolioCardsDeckService } from '@portfolio/services';
import { PortfolioCardsDeckEntity } from '@portfolio/entities';

@Controller()
export default class PortfolioCardsDeckController {
  constructor(
    @InjectPortfolioCardsDeckService() private readonly portfolioCardsDeckService: PortfolioCardsDeckService,
  ) {
    this.mapPortfolioCardsDeckToViewModel = this.mapPortfolioCardsDeckToViewModel.bind(this);
  }

  @Get('/portfolio-cards-decks/my')
  @UseGuards(AuthGuard)
  public async listMyPortfolioCardDecks(@Session() session: secureSession.Session) {
    const decks = await this.portfolioCardsDeckService.listForUser(session.get('userId'));

    return decks.map(this.mapPortfolioCardsDeckToViewModel);
  }

  @Post('/portfolio-cards-decks')
  @UseGuards(AuthGuard)
  public async createPortfolioForCurrentUser(
    @Session() session: secureSession.Session,
    @Body() body: CreatePortfolioCardsDeckDto,
  ) {
    const portfolio = await this.portfolioCardsDeckService.create({
      userId: session.get('userId'),
      cardIds: body.cardIds,
    });

    return this.mapPortfolioCardsDeckToViewModel(portfolio);
  }

  @Put('/portfolio-cards-decks/:id')
  @UseGuards(AuthGuard)
  public async updatePortfolioCardsDeck(
    @Session() session: secureSession.Session,
    @Param('id') deckId: string,
    @Body() body: UpdatePortfolioCardsDeckDto,
  ) {
    const portfolio = await this.portfolioCardsDeckService.update(deckId, {
      cardIds: body.cardIds,
    });

    return this.mapPortfolioCardsDeckToViewModel(portfolio);
  }

  private mapPortfolioCardsDeckToViewModel(deck: PortfolioCardsDeckEntity) {
    return {
      id: deck.getId(),
      cardIds: deck.getCardIds(),
      userId: deck.getUserId(),
    };
  }
}
