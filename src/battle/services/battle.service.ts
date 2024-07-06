import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectPortfolioOfferService, InjectPortfolioRepository } from '@portfolio/decorators';
import { PortfolioRepository } from '@portfolio/repositories';
import { PortfolioOfferService } from '@portfolio/services';
import { InjectUserService, UserService } from '@app/user';
import { getCurrentDayInUtc } from '@common/utils';
import { BattleRepository } from '@app/battle/repositories/battle.repository';
import { InjectBattleRepository } from '@app/battle/decorators';
import { BattleEntity } from '@app/battle/entities/battle.entity';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';

export type GetBattleParams = Pick<BattleEntity, 'offerId' | 'ownerId'>;
export type CreateBattleParams = Pick<BattleEntity, 'offerId' | 'ownerId' | 'entryPrice'>;

export interface BattleService {
  getBattleForOwner(params: GetBattleParams): Promise<BattleEntity>;
  getByBattleId(battleId: string): Promise<BattleEntity>;
  create(params: CreateBattleParams): Promise<BattleEntity>;
  addPlayers(battleId: string, userIds: string[]): Promise<BattleEntity>;
}

@Injectable()
export class BattleServiceImpl implements BattleService {
  constructor(
    @InjectBattleRepository() private readonly battleRepository: BattleRepository,
    @InjectPortfolioOfferService() private readonly portfolioOfferService: PortfolioOfferService,
    @InjectUserService() private readonly userService: UserService,
    @InjectPortfolioRepository() private readonly portfolioRepository: PortfolioRepository,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
  ) {}

  getBattleForOwner(params: GetBattleParams) {
    return this.battleRepository.find({
      ownerId: params.ownerId,
      offerId: params.offerId,
    });
  }

  async addPlayers(battleId: string, userIds: string[]) {
    const battle = await this.getByBattleId(battleId);

    if (!battle) {
      throw new BadRequestException('Provided battle is not found');
    }

    const players = [...new Set([...battle.participants, ...userIds])];

    let updatedBattle: BattleEntity | null = null;

    await this.transactionsManager.useTransaction(async () => {
      for (const player of players) {
        await this.userService.withdrawCoins(player, battle.entryPrice);
      }

      updatedBattle = await this.battleRepository.updateOneById(battle.id, { participants: players });

    });

    return updatedBattle;
  }

  getByBattleId(battleId: string) {
    return this.battleRepository.find({ battleId });
  }

  public async create(params: CreateBattleParams) {
    const offer = await this.portfolioOfferService.getById(params.offerId);

    if (!offer) {
      throw new BadRequestException('Provided offer is not found');
    }

    const user = await this.userService.getById(params.ownerId);

    if (!user) {
      throw new BadRequestException('Provided user is not found');
    }

    if (offer.getDay() !== getCurrentDayInUtc() + 1) {
      throw new BadRequestException('Provided offer is not available.');
    }

    const portfolioForProvidedOfferExists = await this.portfolioRepository.existsByUserIdAndOfferId(
      params.ownerId,
      params.offerId,
    );

    if (!portfolioForProvidedOfferExists) {
      throw new BadRequestException('Portfolio for this day is not found.');
    }

    let createdBattle: BattleEntity | null = null;

    await this.transactionsManager.useTransaction(async () => {

      await this.userService.withdrawCoins(params.ownerId, params.entryPrice);


      createdBattle = await this.battleRepository.create({
        ownerId: params.ownerId,
        offerId: params.offerId,
        entryPrice: params.entryPrice,
      });
    });

    return createdBattle;

  }
}
