import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@common/guards';
import { TokensOfferEntity } from '@coin/entities';
import { TokensOfferService } from '@coin/services';
import { InjectTokensOfferService } from '@coin/decorators';
import { ListLatestTokensOffersDto } from '@coin/dto';

@Controller()
export default class TokensOfferController {
  constructor(@InjectTokensOfferService() private readonly tokensOfferService: TokensOfferService) {}

  @Get('/tokens-offers/latest')
  @UseGuards(AuthGuard)
  public async getLatestTokenOffers(@Query() query: ListLatestTokensOffersDto) {
    const tokensOffers = await this.tokensOfferService.listLatest(query.tournamentId ?? null);

    return tokensOffers.map((tokensOffer) => this.mapTokensOfferToViewModel(tokensOffer));
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
