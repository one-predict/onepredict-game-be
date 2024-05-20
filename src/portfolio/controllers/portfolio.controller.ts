import { Controller, Session, Get, UseGuards, Query, Post, Body } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard, PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { PortfolioService } from '@portfolio/services';
import { InjectPortfolioService } from '@portfolio/decorators';
import { CreatePortfolioDto, ListPortfoliosDto, CreatePortfolioForCurrentUserDto } from '@portfolio/dto';
import { ParseIdentifiersArrayPipe } from '@common/pipes';

@Controller()
export default class PortfolioController {
  constructor(@InjectPortfolioService() private readonly portfolioService: PortfolioService) {}

  @Get('/portfolios')
  @UseGuards(AuthGuard)
  public async getUserPortfolios(
    @Session() session: secureSession.Session,
    @Query('offerIds', new ParseIdentifiersArrayPipe({ separator: ',', maxCount: 10 })) offerIds: string[],
  ) {
    const portfolios = await this.portfolioService.listForUserAndOffers(session.get('userId'), offerIds);

    return portfolios.map((portfolio) => {
      return {
        id: portfolio.getId(),
        offerId: portfolio.getOfferId(),
        userId: portfolio.getUserId(),
        selectedTokens: portfolio.getSelectedTokens(),
        earnedPoints: portfolio.getEarnedPoints(),
        isAwarded: portfolio.isAwarded(),
        createdAt: portfolio.getCreatedAt(),
      };
    });
  }

  @Post('/portfolios')
  @UseGuards(AuthGuard)
  public async createPortfolioForCurrentUser(
    @Session() session: secureSession.Session,
    @Body() createUserDto: CreatePortfolioForCurrentUserDto,
  ) {
    const portfolio = await this.portfolioService.create({
      userId: session.get('userId'),
      selectedTokens: createUserDto.selectedTokens,
      offerId: createUserDto.offerId,
    });

    return {
      id: portfolio.getId(),
      offerId: portfolio.getOfferId(),
      userId: portfolio.getUserId(),
      earnedPoints: portfolio.getEarnedPoints(),
      selectedTokens: portfolio.getSelectedTokens(),
      isAwarded: portfolio.isAwarded(),
      createdAt: portfolio.getCreatedAt(),
    };
  }

  // GRPC Style
  @Post('/portfolios/listPortfolios')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async listPortfolios(@Body() body: ListPortfoliosDto) {
    const portfolios = await this.portfolioService.list({
      userId: body.userId,
      offerIds: body.offerIds,
    });

    return portfolios.map((portfolio) => {
      return {
        id: portfolio.getId(),
        offerId: portfolio.getOfferId(),
        userId: portfolio.getUserId(),
        selectedTokens: portfolio.getSelectedTokens(),
        earnedPoints: portfolio.getEarnedPoints(),
        isAwarded: portfolio.isAwarded(),
        createdAt: portfolio.getCreatedAt(),
      };
    });
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

    return {
      id: portfolio.getId(),
      offerId: portfolio.getOfferId(),
      userId: portfolio.getUserId(),
      earnedPoints: portfolio.getEarnedPoints(),
      selectedTokens: portfolio.getSelectedTokens(),
      isAwarded: portfolio.isAwarded(),
      createdAt: portfolio.getCreatedAt(),
    };
  }
}
