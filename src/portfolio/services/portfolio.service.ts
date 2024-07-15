import { Cron } from '@nestjs/schedule';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectPortfolioOfferService, InjectPortfolioRepository } from '@portfolio/decorators';
import { PortfolioRepository } from '@portfolio/repositories';
import { PortfolioEntity, PortfolioOfferEntity } from '@portfolio/entities';
import { PortfolioOfferService } from '@portfolio/services';
import { InjectUserService, UserService } from '@app/user';
import { getBattlePortfoliosRewards, getCurrentDayInUtc } from '@common/utils';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';
import { InjectTournamentParticipationService, InjectTournamentService } from '@tournament/decorators';
import { TournamentParticipationService, TournamentService } from '@tournament/services';
import { InjectBattleService } from "@app/battle/decorators";
import { BattleService } from "@app/battle/services";

export interface ListPortfoliosParams {
  userId?: string;
  offerIds?: string[];
}

export interface CreatePortfolioParams {
  userId: string;
  selectedTokens: string[];
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
    @InjectBattleService() private readonly battleService: BattleService,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
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

    return this.portfolioRepository.create({
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
          isAwarded: true,
        });

        for (const portfolio of portfolios) {
          const earnedCoins = portfolio.getSelectedTokens().reduce((previousCoins, selectedToken) => {
            const percentage = offerPriceChanges[selectedToken];

            if (typeof percentage !== 'number') {
              throw new Error('Percentage change not found for token.');
            }

            return previousCoins + percentage;
          }, 0);

          await this.transactionsManager.useTransaction(async () => {
            await this.portfolioRepository.updateOneById(portfolio.getId(), {
              isAwarded: true,
              earnedCoins,
            });

            await this.userService.addCoins(portfolio.getUserId(), earnedCoins);

            await this.tournamentParticipationService.bulkAddPoints(
              tournaments.map((participation) => participation.getId()),
              earnedCoins,
            );
          });
        }

        await this.portfolioOfferService.markOfferCompleted(offer.getId());

        Logger.log(`Offer ${offer.getId()} completed, updated ${portfolios.length} portfolios.`);

        try {
          await this.distributeBattlePointsForOffer(offer.getId());
        } catch (error) {
          Logger.error(`Failed to distribute battle points for offer: ${offer.getId()}`, error);
        }
      } catch (error) {
        Logger.error(`Failed to award portfolios for offer: ${offer.getId()}`, error);
      }
    }
  }

  private validateSelectedTokens(selectedTokens: string[], offer: PortfolioOfferEntity) {
    const tokenOffers = offer.getTokenOffers();

    if (selectedTokens.length !== tokenOffers.length) {
      throw new BadRequestException('Invalid number of selected tokens');
    }

    return selectedTokens.every((token, index) => {
      return tokenOffers[index].firstToken === token || tokenOffers[index].secondToken === token;
    });
  }

  private async distributeBattlePointsForOffer(offerId: string) {
    const battles = await this.battleService.findAllByOfferId(offerId);

    for (const battle of battles) {
      const portfolios = await this.portfolioRepository.find({
        userId: battle.players.map(( { userId } ) => userId),
        offerIds: [battle.offerId],
      });

      if (!portfolios.length) {
        Logger.log(`No portfolios found for battle ${battle.id}`);
        continue;
      }

      if (portfolios.length === 1) {
        const userId = portfolios[0].getUserId();
        Logger.log(`Only 1 portfolio found for battle ${battle.id}, coins(${battle.entryPrice}) will be returned to user #${userId}.`);
        await this.userService.addCoins(userId, battle.entryPrice);
        continue;
      }

      const winnerPortfolios = getBattlePortfoliosRewards(portfolios, battle.entryPrice);

      for (const winnerPortfolio of winnerPortfolios) {
        await this.userService.addCoins(winnerPortfolio.userId, winnerPortfolio.rewards);
        Logger.log(
            `User #${winnerPortfolio.userId}  won ${winnerPortfolio.rewards} coins.`,
        );
      }

      const players = battle.players.map((player) => {
        const winner = winnerPortfolios.find((winnerPortfolio) => winnerPortfolio.userId === player.userId);

        if (winner) {
          const battlePoints = winner.rewards - battle.entryPrice;

          return {
            ...player,
            points: battlePoints,
          };
        }

        return player;
      });

      await this.battleService.update(battle.id, { players });
      Logger.log(`Battle ${battle.id} completed, updated ${players.length} players.`);
    }
  }
}
