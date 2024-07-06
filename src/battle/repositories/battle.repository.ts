import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Battle } from '../schemas/battle.schema';
import { BattleEntity, MongoBattleEntity } from '../entities/battle.entity';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';
import {PortfolioOffer} from "@portfolio/schemas";

interface FindBattleEntityParams {
  ownerId?: string;
  offerId?: string;
  battleId?: string;
}

export type CreateBattleEntityParams = Pick<BattleEntity, 'ownerId' | 'offerId' | 'entryPrice'>;

export interface BattleRepository {
  find(params: FindBattleEntityParams): Promise<BattleEntity>;
  create(params: CreateBattleEntityParams): Promise<BattleEntity>;
  updateOneById(id: string, params: Partial<BattleEntity>): Promise<BattleEntity>;
}

@Injectable()
export class MongoBattleRepository implements BattleRepository {
  public constructor(
    @InjectModel(Battle.name) private battleModel: Model<Battle>,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
  ) {}

  private async getPopulatedBattleById(battleId: string) {
    return await this.find({ battleId });
  }

  async find(params: FindBattleEntityParams): Promise<BattleEntity> {
    const battleDocument = await this.battleModel
      .findOne({
        ...(params.ownerId && { ownerId: new ObjectId(params.ownerId) }),
        ...(params.offerId && { offerId: new ObjectId(params.offerId) }),
        ...(params.battleId && { battleId: params.battleId }),
      })
      .populate([
        {
          path: 'offerId',
          model: PortfolioOffer.name,
        },
      ])
      .lean()
      .exec();

    return battleDocument && new MongoBattleEntity(battleDocument).getBattle();
  }

  async create(params: CreateBattleEntityParams) {
    const portfolioDocument = await this.battleModel.create({
      ...params,
      battleId: new ObjectId().toHexString(),
      participants: [params.ownerId],
    });

    return this.getPopulatedBattleById(portfolioDocument.battleId);
  }

  async updateOneById(id: string, params: Partial<BattleEntity>) {
    const document = await this.battleModel
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        params,
        { new: true },
      )
      .lean()
      .exec();

    return document && this.getPopulatedBattleById(document.battleId);
  }
}
