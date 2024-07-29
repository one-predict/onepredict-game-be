import {
  Controller,
  Get,
  UseGuards,
  ParseIntPipe,
  Body,
  Post,
} from '@nestjs/common';
import { AuthGuard, PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { PortfolioOfferService } from '@portfolio/services';
import { InjectPortfolioOfferService } from '@portfolio/decorators';

@Controller()
export default class PortfolioController {
  constructor(@InjectPortfolioOfferService() private readonly portfolioOfferService: PortfolioOfferService) {}

  @Get('/portfolio-offers/latest')
  @UseGuards(AuthGuard)
  public async getPortfolioOffersForDays() {
    const portfolioOffers = await this.portfolioOfferService.listLatestOffers();

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
