import { sampleSize } from 'lodash';
import { Injectable } from '@nestjs/common';
import { ModeBasedCron } from '@common/decorators';
import { SortDirection } from '@common/enums';
import { getCurrentUnixTimestamp, getNearestHourInUnixTimestamp } from '@common/utils';
import { Coin } from '@coin';
import { InjectTokensOfferRepository } from '@offer/decorators';
import { TokensOfferRepository } from '@offer/repositories';
import { TokensOfferEntity } from '@offer/entities';
import { TokensOfferSortField } from '@offer/enums';
import { tokens } from '@offer/data';

interface TokensOffersSeries {
  next: TokensOfferEntity | null;
  current: TokensOfferEntity | null;
  previous: TokensOfferEntity[];
}

export interface TokensOfferService {
  getById(id: string): Promise<TokensOfferEntity | null>;
  getOffersSeries(tournamentId: string | null): Promise<TokensOffersSeries>;
}

@Injectable()
export class TokensOfferServiceImpl implements TokensOfferService {
  private readonly MAX_OFFERS_PER_SERIES_QUERY = 30;
  private readonly MAX_TOKENS_PER_OFFER = 12;
  private readonly MAIN_GAME_NUMBER_OF_OFFERS_TO_GENERATE = 7 * 24; // 7 days * 24 hours
  private readonly MAIN_GAME_OFFERS_GENERATION_THRESHOLD = 60 * 60 * 24 * 3; // 3 days in seconds
  private readonly MAIN_GAME_DURATION_IN_SECONDS = 60 * 60 * 2; // 2 hours in seconds

  constructor(@InjectTokensOfferRepository() private readonly tokensOfferRepository: TokensOfferRepository) {}

  public async getOffersSeries(tournamentId: string | null) {
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

  @ModeBasedCron('0 * * * *')
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
