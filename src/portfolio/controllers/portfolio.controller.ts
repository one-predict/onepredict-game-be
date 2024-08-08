import { Controller, Session, Get, UseGuards, Query, Post, Body } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard, PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { PortfolioService } from '@portfolio/services';
import { InjectPortfolioService } from '@portfolio/decorators';
import { CreatePortfolioDto, ListPortfoliosDto, CreatePortfolioForCurrentUserDto } from '@portfolio/dto';
import { ParseIdentifiersArrayPipe } from '@common/pipes';
import { PortfolioEntity } from '@app/portfolio';

@Controller()
export default class PortfolioController {
  constructor(@InjectPortfolioService() private readonly portfolioService: PortfolioService) {
    this.mapPortfolioEntityToViewModel = this.mapPortfolioEntityToViewModel.bind(this);
  }

  @Get('/portfolios')
  @UseGuards(AuthGuard)
  public async getUserPortfolios(
    @Session() session: secureSession.Session,
    @Query('offerIds', new ParseIdentifiersArrayPipe({ separator: ',', maxCount: 15 })) offerIds: string[],
  ) {
    const portfolios = await this.portfolioService.listForUserAndOffers(session.get('userId'), offerIds);

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

  // GRPC Style
  @Post('/portfolios/listPortfolios')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async listPortfolios(@Body() body: ListPortfoliosDto) {
    const portfolios = await this.portfolioService.list({
      userId: body.userId,
      offerIds: body.offerIds,
    });

    return portfolios.map(this.mapPortfolioEntityToViewModel);
  }

  // GRPC Style
  @Post('/portfolios/createPortfolio')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async createPortfolio(@Body() body: CreatePortfolioDto) {
    const portfolio = await this.portfolioService.create({
      userId: body.userId,
      offerId: body.offerId,
      selectedTokens: body.selectedTokens,
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
