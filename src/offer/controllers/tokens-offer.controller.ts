import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@common/guards';
import { TokensOfferEntity } from '@offer/entities';
import { TokensOfferService } from '@offer/services';
import { InjectTokensOfferService } from '@offer/decorators';
import { ListLatestTokensOffersDto } from '@offer/dto';

@Controller()
export default class TokensOfferController {
  constructor(@InjectTokensOfferService() private readonly tokensOfferService: TokensOfferService) {}

  @Get('/tokens-offers/series')
  @UseGuards(AuthGuard)
  public async getOffersSeries(@Query() query: ListLatestTokensOffersDto) {
    const series = await this.tokensOfferService.getOffersSeries(query.tournamentId ?? null);

    return {
      next: series.next ? this.mapTokensOfferToViewModel(series.next) : null,
      current: series.current ? this.mapTokensOfferToViewModel(series.current) : null,
      previous: series.previous.map((offer) => this.mapTokensOfferToViewModel(offer)),
    };
  }

  private mapTokensOfferToViewModel(tokensOffer: TokensOfferEntity) {
    return {
      id: tokensOffer.getId(),
      timestamp: tokensOffer.getTimestamp(),
      durationInSeconds: tokensOffer.getDurationInSeconds(),
      opensAfterTimestamp: tokensOffer.getOpensAfterTimestamp(),
      tokens: tokensOffer.getTokens(),
      tournamentId: tokensOffer.getTournamentId(),
    };
  }
}
