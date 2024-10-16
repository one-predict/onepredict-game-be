import { Controller, Session, Get, UseGuards, Query, Post, Body } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { PortfolioService } from '@portfolio/services';
import { InjectPortfolioService } from '@portfolio/decorators';
import { CreatePortfolioDto, ListPortfoliosDto } from '@portfolio/dto';
import { PortfolioEntity } from '@portfolio/entities';

@Controller()
export default class PortfolioController {
  constructor(@InjectPortfolioService() private readonly portfolioService: PortfolioService) {
    this.mapPortfolioEntityToViewModel = this.mapPortfolioEntityToViewModel.bind(this);
  }

  @Get('/portfolios/my')
  @UseGuards(AuthGuard)
  public async listMyPortfolios(@Session() session: secureSession.Session, @Query() query: ListPortfoliosDto) {
    const portfolios = await this.portfolioService.list({
      filter: {
        offerIds: query.offerIds,
        userId: session.get('userId'),
      },
    });

    return portfolios.map(this.mapPortfolioEntityToViewModel);
  }

  @Post('/portfolios')
  @UseGuards(AuthGuard)
  public async createPortfolio(@Session() session: secureSession.Session, @Body() body: CreatePortfolioDto) {
    const portfolio = await this.portfolioService.create({
      userId: session.get('userId'),
      predictions: body.predictions,
      tournamentId: body.tournamentId,
      offerId: body.offerId,
    });

    return this.mapPortfolioEntityToViewModel(portfolio);
  }

  private mapPortfolioEntityToViewModel(portfolio: PortfolioEntity) {
    return {
      id: portfolio.getId(),
      offerId: portfolio.getOfferId(),
      userId: portfolio.getUserId(),
      predictions: portfolio.getPredictions(),
      interval: portfolio.getInterval(),
      tournamentId: portfolio.getTournamentId(),
      result: portfolio.getResult(),
      isAwarded: portfolio.isAwarded(),
      createdAt: portfolio.getCreatedAt(),
    };
  }
}
