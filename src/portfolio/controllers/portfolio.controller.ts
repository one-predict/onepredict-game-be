import { Controller, Session, Get, UseGuards, Query, Post, Body } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { PortfolioService } from '@portfolio/services';
import { InjectPortfolioService } from '@portfolio/decorators';
import { CreatePortfolioDto } from '@portfolio/dto';
import { ParseIdentifiersArrayPipe } from '@common/pipes';

@Controller()
export default class PortfolioController {
  constructor(@InjectPortfolioService() private readonly portfolioService: PortfolioService) {}

  @Get('/portfolios')
  @UseGuards(AuthGuard)
  public async getUserPortfolios(
    @Session() session: secureSession.Session,
    @Query('offerIds', new ParseIdentifiersArrayPipe({ separator: ',' })) offerIds: string[],
  ) {
    const portfolios = await this.portfolioService.listForUserAndOffers(session.get('userId'), offerIds);

    return portfolios.map((portfolio) => {
      return {
        id: portfolio.getId(),
        offerId: portfolio.getOfferId(),
        userId: portfolio.getUserId(),
        earnedPoints: portfolio.getEarnedPoints(),
        isAwarded: portfolio.isAwarded(),
        createdAt: portfolio.getCreatedAt(),
      };
    });
  }

  @Post('/portfolios')
  @UseGuards(AuthGuard)
  public async createPortfolio(
    @Session() session: secureSession.Session,
    @Body() createUserDto: CreatePortfolioDto,
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
      isAwarded: portfolio.isAwarded(),
      createdAt: portfolio.getCreatedAt(),
    };
  }
}
