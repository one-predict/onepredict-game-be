import { Injectable } from '@nestjs/common';
import { BattleRepository } from '@app/battle/repositories/battle.repository';
import { InjectBattleRepository } from '@app/battle/decorators';
import { BattleEntity } from '@app/battle/entities/battle.entity';

export type GetBattleParams = Pick<BattleEntity, 'offerId' | 'ownerId'>;
export type CreateBattleParams = Pick<BattleEntity, 'offerId' | 'ownerId' | 'entryPrice'>;

export interface BattleService {
  getBattleForOwner(params: GetBattleParams): Promise<BattleEntity>;
  getByDisplayId(battleId: string): Promise<BattleEntity>;
  create(params: CreateBattleParams): Promise<BattleEntity>;
  update(id: string, params: Partial<BattleEntity>): Promise<BattleEntity>;
  findAllByOfferId(offerId: string): Promise<BattleEntity[]>;
  addPlayer(battle: BattleEntity, userId: string): Promise<BattleEntity>;
}

@Injectable()
export class BattleServiceImpl implements BattleService {

  constructor(@InjectBattleRepository() private readonly battleRepository: BattleRepository) {}

  getBattleForOwner(params: GetBattleParams) {
    return this.battleRepository.find({
      ownerId: params.ownerId,
      offerId: params.offerId,
    });
  }

  getByDisplayId(displayId: string) {
    return this.battleRepository.find({ displayId });
  }

  async create(params: CreateBattleParams) {
    return await this.battleRepository.create({
      ownerId: params.ownerId,
      offerId: params.offerId,
      entryPrice: params.entryPrice,
      staticPrizePool: 0,
    });
  }

  async update(id: string, params: Partial<BattleEntity>): Promise<BattleEntity> {
    return this.battleRepository.updateOneById(id, params);
  }

  async findAllByOfferId(offerId: string) {
      return this.battleRepository.findAllByOfferId(offerId);
  }

  async addPlayer(battle: BattleEntity, userId: string) {
    const players = [...battle.players, { userId, points: 0 }];

    return this.battleRepository.updateOneById(battle.id, { players });
  }
}
