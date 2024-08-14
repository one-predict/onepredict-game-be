import { round } from 'lodash';
import { Cron } from '@nestjs/schedule';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectUserService, UserService } from '@user';
import {
  InjectTournamentParticipationService,
  InjectTournamentService,
  TournamentParticipationService,
  TournamentService,
} from '@tournament';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { getCurrentDayInUtc } from '@common/utils';
import { InjectPortfolioOfferService, InjectPortfolioRepository } from '@portfolio/decorators';
import { PortfolioRepository } from '@portfolio/repositories';
import { PortfolioEntity, PortfolioOfferEntity } from '@portfolio/entities';
import { PortfolioOfferService } from '@portfolio/services';
import { SelectedPortfolioToken } from '@portfolio/schemas';

export interface ListPortfoliosParams {
  userId?: string;
  offerIds?: string[];
}

export interface CreatePortfolioParams {
  userId: string;
  selectedTokens: SelectedPortfolioToken[];
  offerId: string;
}

export interface PortfolioService {
  list(params: ListPortfoliosParams): Promise<PortfolioEntity[]>;
  listForUserAndOffers(userId: string, offerIds: string[]): Promise<PortfolioEntity[]>;
  create(params: CreatePortfolioParams): Promise<PortfolioEntity>;
}

@Injectable()
export class PortfolioServiceImpl implements PortfolioService {
  constructor(
    @InjectPortfolioRepository() private readonly portfolioRepository: PortfolioRepository,
    @InjectPortfolioOfferService() private readonly portfolioOfferService: PortfolioOfferService,
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectTournamentParticipationService()
    private readonly tournamentParticipationService: TournamentParticipationService,
    @InjectUserService() private readonly userService: UserService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public list(params: ListPortfoliosParams) {
    return this.portfolioRepository.find({
      userId: params.userId,
      offerIds: params.offerIds,
    });
  }

  public listForUserAndOffers(userId: string, offerIds: string[]) {
    if (!offerIds.length) {
      throw new BadRequestException('At least one offer should be provided.');
    }

    return this.portfolioRepository.find({
      userId,
      offerIds,
    });
  }

  public async create(params: CreatePortfolioParams) {
    const offer = await this.portfolioOfferService.getById(params.offerId);

    if (!offer) {
      throw new BadRequestException('Provided offer is not found');
    }

    const user = await this.userService.getById(params.userId);

    if (!user) {
      throw new BadRequestException('Provided user is not found');
    }

    if (offer.getDay() !== getCurrentDayInUtc() + 1) {
      throw new BadRequestException('Provided offer is not available.');
    }

    this.validateSelectedTokens(params.selectedTokens, offer);

    const portfolioForProvidedOfferExists = await this.portfolioRepository.existsByUserIdAndOfferId(
      params.userId,
      params.offerId,
    );

    if (portfolioForProvidedOfferExists) {
      throw new BadRequestException('Portfolio for this day already submitted.');
    }

    return this.portfolioRepository.createOne({
      user: params.userId,
      selectedTokens: params.selectedTokens,
      offer: params.offerId,
      isAwarded: false,
    });
  }

  @Cron('*/30 * * * *')
  public async awardPortfolios() {
    const offers = await this.portfolioOfferService.listOffersWaitingForCompletion();

    if (!offers.length) {
      return;
    }

    const firstOfferDay = offers[0].getDay();
    const lastOfferDay = offers[offers.length - 1].getDay();

    const tournaments = await this.tournamentService.listBetweenDays(firstOfferDay, lastOfferDay);

    for (const offer of offers) {
      try {
        const offerPriceChanges = offer.getPriceChanges();

        const portfolios = await this.portfolioRepository.find({
          offerId: offer.getId(),
          isAwarded: false,
        });

        for (const portfolio of portfolios) {
          const earnedCoins = portfolio.getSelectedTokens().reduce((previousCoins, selectedToken) => {
            const percentage = offerPriceChanges[selectedToken.id];

            if (typeof percentage !== 'number') {
              throw new Error('Percentage change not found for token.');
            }

            return previousCoins + (selectedToken.direction === 'falling' ? -percentage : percentage);
          }, 0);

          await this.transactionsManager.useTransaction(async () => {
            await this.portfolioRepository.updateOneById(portfolio.getId(), {
              isAwarded: true,
              earnedCoins: round(earnedCoins, 2),
            });

            await this.userService.addCoins(portfolio.getUserId(), earnedCoins);

            await this.tournamentParticipationService.bulkAddPoints(
              tournaments.map((tournament) => tournament.getId()),
              portfolio.getUserId(),
              earnedCoins,
            );
          });
        }

        await this.portfolioOfferService.markOfferCompleted(offer.getId());

        Logger.log(`Offer ${offer.getId()} completed, updated ${portfolios.length} portfolios.`);
      } catch (error) {
        Logger.error(`Failed to award portfolios for offer: ${offer.getId()}`, error);
      }
    }
  }

  private validateSelectedTokens(selectedTokens: SelectedPortfolioToken[], offer: PortfolioOfferEntity) {
    const offerTokens = offer.getTokens();

    return selectedTokens.every((token) => {
      return offerTokens.includes(token.id);
    });
  }
}
