import { Controller, Session, Get, UseGuards, Query, Post, Body } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { ParseIdentifiersArrayPipe } from '@common/pipes';
import { PortfolioService } from '@portfolio/services';
import { InjectPortfolioService } from '@portfolio/decorators';
import { CreatePortfolioForCurrentUserDto } from '@portfolio/dto';
import { PortfolioEntity } from '@portfolio/entities';

@Controller()
export default class PortfolioController {
  constructor(@InjectPortfolioService() private readonly portfolioService: PortfolioService) {
    this.mapPortfolioEntityToViewModel = this.mapPortfolioEntityToViewModel.bind(this);
  }

  @Get('/portfolios/my')
  @UseGuards(AuthGuard)
  public async listMyPortfolios(
    @Session() session: secureSession.Session,
    @Query('offerIds', new ParseIdentifiersArrayPipe({ separator: ',', maxCount: 15 })) offerIds: string[],
  ) {
    const portfolios = await this.portfolioService.list({
      filter: {
        offerIds,
        userId: session.get('userId'),
      },
    });

    return portfolios.map(this.mapPortfolioEntityToViewModel);
  }

  @Post('/portfolios')
  @UseGuards(AuthGuard)
  public async createPortfolioForCurrentUser(
    @Session() session: secureSession.Session,
    @Body() createPortfolioForCurrentUserDto: CreatePortfolioForCurrentUserDto,
  ) {
    const portfolio = await this.portfolioService.create({
      userId: session.get('userId'),
      selectedTokens: createPortfolioForCurrentUserDto.selectedTokens,
      offerId: createPortfolioForCurrentUserDto.offerId,
    });

    return this.mapPortfolioEntityToViewModel(portfolio);
  }

  private mapPortfolioEntityToViewModel(portfolio: PortfolioEntity) {
    return {
      id: portfolio.getId(),
      offerId: portfolio.getOfferId(),
      userId: portfolio.getUserId(),
      selectedTokens: portfolio.getSelectedTokens(),
      earnedCoins: portfolio.getEarnedCoins(),
      isAwarded: portfolio.isAwarded(),
      createdAt: portfolio.getCreatedAt(),
    };
  }
}
