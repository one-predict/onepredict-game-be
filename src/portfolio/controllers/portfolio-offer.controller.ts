import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Body,
  Post,
} from '@nestjs/common';
import { AuthGuard, PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { PortfolioOfferService } from '@portfolio/services';
import { InjectPortfolioOfferService } from '@portfolio/decorators';
import { LimitIntPipe } from '@common/pipes';

@Controller()
export default class PortfolioController {
  constructor(@InjectPortfolioOfferService() private readonly portfolioOfferService: PortfolioOfferService) {}

  @Get('/portfolio-offers')
  @UseGuards(AuthGuard)
  public async getPortfolioOffersForDays(
    @Query('days', new DefaultValuePipe(1), new ParseIntPipe(), new LimitIntPipe(3)) days: number,
  ) {
    const portfolioOffers = await this.portfolioOfferService.listOffersForDays(days);

    return portfolioOffers.map((portfolioOffer) => {
      return {
        id: portfolioOffer.getId(),
        day: portfolioOffer.getDay(),
        date: portfolioOffer.getDate(),
        tokenOffers: portfolioOffer.getTokenOffers(),
      };
    });
  }

  // GRPC Style
  @Post('/portfolio-offers/getOfferByDay')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getPortfolioOfferByDay(@Body('offerDay', new ParseIntPipe()) day: number) {
    const portfolioOffer = await this.portfolioOfferService.getByDay(day);

    return {
      offer: portfolioOffer && {
        id: portfolioOffer.getId(),
        day: portfolioOffer.getDay(),
        date: portfolioOffer.getDate(),
        tokenOffers: portfolioOffer.getTokenOffers(),
      },
    };
  }
}
