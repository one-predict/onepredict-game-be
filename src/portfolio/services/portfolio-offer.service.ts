import { sampleSize } from 'lodash';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectPortfolioOfferRepository } from '@portfolio/decorators';
import {
  PortfolioOfferRepository,
  CreatePortfolioOfferParams as CreatePortfolioOfferModelParams,
} from '@portfolio/repositories';
import { PortfolioOfferEntity } from '@portfolio/entities';
import { getCurrentDay } from '@common/utils';
import tokens from '@portfolio/data/tokens';

export interface PortfolioOfferService {
  getById(id: string): Promise<PortfolioOfferEntity | null>;
  listOffersForDays(days: number): Promise<PortfolioOfferEntity[]>;
}

@Injectable()
export class PortfolioOfferServiceImpl implements PortfolioOfferService {
  private MAX_DAYS_THRESHOLD = 3;
  private OFFERS_TO_GENERATE = 7;
  private MAX_TOKEN_OFFERS = 6;

  constructor(
    @InjectPortfolioOfferRepository() private readonly portfolioOfferRepository: PortfolioOfferRepository,
  ) {}

  public listOffersForDays(days: number) {
    const currentDay = getCurrentDay();

    return this.portfolioOfferRepository.find({
      fromDay: currentDay - days,
      toDay: currentDay + 1,
    });
  }

  @Cron('0 * * * *')
  public async generateOffers() {
    const lastOffer = await this.portfolioOfferRepository.findLatest();

    const currentDay = getCurrentDay();

    const nextOfferDay = lastOffer ? lastOffer.getDay() + 1 : currentDay;

    if (nextOfferDay - currentDay > this.MAX_DAYS_THRESHOLD) {
      return;
    }

    const offers: CreatePortfolioOfferModelParams[] = [];

    for (let day = nextOfferDay; day <= nextOfferDay + this.OFFERS_TO_GENERATE; day++) {
      const availableTokens: string[] = sampleSize(tokens, this.MAX_TOKEN_OFFERS * 2);

      offers.push({
        day,
        tokenOffers: new Array(this.MAX_TOKEN_OFFERS).fill(null).map((_, index) => {
          return {
            firstToken: availableTokens[index * 2],
            secondToken: availableTokens[index * 2 + 1],
          };
        }),
      });
    }

    await this.portfolioOfferRepository.createMany(offers);
  }

  public getById(id: string) {
    return this.portfolioOfferRepository.findById(id);
  }
}
