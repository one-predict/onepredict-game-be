import {
  Controller,
  Get,
  UseGuards,
  ParseIntPipe,
  Body,
  Post,
} from '@nestjs/common';
import { AuthGuard, PrivateApiAuthorizationTokenGuard } from '@common/guards';
import { PortfolioOfferEntity } from "@portfolio/entities";
import { PortfolioOfferService } from '@portfolio/services';
import { InjectPortfolioOfferService } from '@portfolio/decorators';

@Controller()
export default class PortfolioController {
  constructor(@InjectPortfolioOfferService() private readonly portfolioOfferService: PortfolioOfferService) {}

  @Get('/portfolio-offers/latest')
  @UseGuards(AuthGuard)
  public async getPortfolioOffersForDays() {
    const portfolioOffers = await this.portfolioOfferService.listLatestOffers();

    return portfolioOffers.map((portfolioOffer) => this.mapPortfolioOfferEntityToViewModel(portfolioOffer));
  }

  // GRPC Style
  @Post('/portfolio-offers/getOfferByDay')
  @UseGuards(PrivateApiAuthorizationTokenGuard)
  public async getPortfolioOfferByDay(@Body('offerDay', new ParseIntPipe()) day: number) {
    const portfolioOffer = await this.portfolioOfferService.getByDay(day);

    return {
      offer: portfolioOffer && this.mapPortfolioOfferEntityToViewModel(portfolioOffer),
    };
  }

  private mapPortfolioOfferEntityToViewModel(portfolioOffer: PortfolioOfferEntity) {
    return {
      id: portfolioOffer.getId(),
      day: portfolioOffer.getDay(),
      date: portfolioOffer.getDate(),
      tokens: portfolioOffer.getTokens(),
    };
  }
}
