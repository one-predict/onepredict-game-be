import { Injectable } from '@nestjs/common';
import { SortDirection } from '@common/enums';
import { getCurrentUnixTimestamp } from '@common/utils';
import { InjectTokensOfferRepository } from '@offer/decorators';
import { TokensOfferRepository } from '@offer/repositories';
import { TokensOfferEntity } from '@offer/entities';
import { TokensOfferSortField } from '@offer/enums';

interface TokensOffersSeries {
  next: TokensOfferEntity | null;
  current: TokensOfferEntity | null;
  previous: TokensOfferEntity[];
}

export interface TokensOfferService {
  getById(id: string): Promise<TokensOfferEntity | null>;
  getOffersSeries(tournamentId: string): Promise<TokensOffersSeries>;
}

@Injectable()
export class TokensOfferServiceImpl implements TokensOfferService {
  private readonly MAX_OFFERS_PER_SERIES_QUERY = 30;

  constructor(@InjectTokensOfferRepository() private readonly tokensOfferRepository: TokensOfferRepository) {}

  public async getOffersSeries(tournamentId: string) {
    const currentUnixTimestamp = getCurrentUnixTimestamp();

    const [currentOffer, ...previousOffers] = await this.tokensOfferRepository.find({
      filter: {
        tournamentId,
        startsBefore: currentUnixTimestamp,
      },
      sort: [
        {
          field: TokensOfferSortField.Timestamp,
          direction: SortDirection.Descending,
        },
      ],
      limit: this.MAX_OFFERS_PER_SERIES_QUERY,
    });

    const currentOfferTimestamp = currentOffer?.getTimestamp();

    const [nextOffer] = await this.tokensOfferRepository.find({
      filter: {
        tournamentId,
        startsAfter: currentOfferTimestamp ? currentOfferTimestamp + 1 : currentUnixTimestamp,
      },
      sort: [
        {
          field: TokensOfferSortField.Timestamp,
          direction: SortDirection.Ascending,
        },
      ],
      limit: 1,
    });

    return {
      next: nextOffer ?? null,
      current: currentOffer ?? null,
      previous: previousOffers,
    };
  }

  public getById(id: string) {
    return this.tokensOfferRepository.findById(id);
  }
}
