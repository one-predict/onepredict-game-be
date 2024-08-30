import { sampleSize } from 'lodash';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SortDirection } from '@common/enums';
import { getCurrentUnixTimestamp, getNearestHourInUnixTimestamp } from '@common/utils';
import { InjectTokensOfferRepository } from '@coin/decorators';
import { TokensOfferRepository } from '@coin/repositories';
import { TokensOfferEntity } from '@coin/entities';
import { Coin, TokensOfferSortField } from '@coin/enums';
import { tokens } from '@coin/data';

export interface TokensOfferService {
  getById(id: string): Promise<TokensOfferEntity | null>;
  listLatest(tournamentId: string | null): Promise<TokensOfferEntity[]>;
}

@Injectable()
export class TokensOfferServiceImpl implements TokensOfferService {
  private readonly MAX_TOKENS_PER_LATEST_QUERY = 10;
  private readonly MAX_TOKENS_PER_OFFER = 12;
  private readonly MAIN_GAME_NUMBER_OF_OFFERS_TO_GENERATE = 7 * 24; // 7 days * 24 hours
  private readonly MAIN_GAME_OFFERS_GENERATION_THRESHOLD = 60 * 60 * 24 * 3; // 3 days in seconds
  private readonly MAIN_GAME_DURATION_IN_SECONDS = 60 * 60 * 2; // 2 hours in seconds

  constructor(@InjectTokensOfferRepository() private readonly tokensOfferRepository: TokensOfferRepository) {}

  public async listLatest(tournamentId: string | null) {
    const [currentOffer, ...previousOffers] = await this.tokensOfferRepository.find({
      filter: {
        tournamentId,
        startsBefore: getCurrentUnixTimestamp(),
      },
      sort: [
        {
          field: TokensOfferSortField.Timestamp,
          direction: SortDirection.Descending,
        },
      ],
      limit: this.MAX_TOKENS_PER_LATEST_QUERY,
    });

    if (!currentOffer) {
      return [];
    }

    const [nextOffer] = await this.tokensOfferRepository.find({
      filter: {
        tournamentId,
        startsAfter: currentOffer.getTimestamp() + 1,
      },
      sort: [
        {
          field: TokensOfferSortField.Timestamp,
          direction: SortDirection.Ascending,
        },
      ],
      limit: 1,
    });

    return [nextOffer, currentOffer, ...previousOffers];
  }

  public getById(id: string) {
    return this.tokensOfferRepository.findById(id);
  }

  @Cron('0 * * * *')
  public async generateMainGameOffers() {
    const [lastMainGameOffer] = await this.tokensOfferRepository.find({
      filter: {
        tournamentId: null,
      },
      sort: [
        {
          field: TokensOfferSortField.Timestamp,
          direction: SortDirection.Descending,
        },
      ],
      limit: 1,
    });

    const currentTimestamp = getCurrentUnixTimestamp();

    if (
      lastMainGameOffer &&
      lastMainGameOffer.getTimestamp() - currentTimestamp > this.MAIN_GAME_OFFERS_GENERATION_THRESHOLD
    ) {
      return;
    }

    const initialTimestamp = lastMainGameOffer ? lastMainGameOffer.getTimestamp() : getNearestHourInUnixTimestamp();

    await this.tokensOfferRepository.createMany(
      new Array(this.MAIN_GAME_NUMBER_OF_OFFERS_TO_GENERATE).fill(null).map((key, index) => {
        const offerTimestamp = initialTimestamp + (index + 1) * this.MAIN_GAME_DURATION_IN_SECONDS;

        return {
          timestamp: offerTimestamp,
          tokens: sampleSize(tokens, this.MAX_TOKENS_PER_OFFER) as Coin[],
          durationInSeconds: this.MAIN_GAME_DURATION_IN_SECONDS,
          opensAfterTimestamp: offerTimestamp - this.MAIN_GAME_DURATION_IN_SECONDS,
        };
      }),
    );
  }
}
