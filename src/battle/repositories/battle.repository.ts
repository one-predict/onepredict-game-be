import { ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Battle } from '../schemas/battle.schema';
import { BattleEntity, MongoBattleEntity } from '../entities/battle.entity';
import { PortfolioOffer } from "@portfolio/schemas";

interface FindBattleEntityParams {
  ownerId?: string;
  offerId?: string;
  displayId?: string;
}

export type CreateBattleEntityParams = Pick<BattleEntity, 'ownerId' | 'offerId' | 'entryPrice' | 'staticPrizePool'>;

export interface BattleRepository {
  find(params: FindBattleEntityParams): Promise<BattleEntity>;
  create(params: CreateBattleEntityParams): Promise<BattleEntity>;
  updateOneById(id: string, params: Partial<BattleEntity>): Promise<BattleEntity>;
  findAllByOfferId(offerId: string): Promise<BattleEntity[]>;
}

@Injectable()
export class MongoBattleRepository implements BattleRepository {
  public constructor(
    @InjectModel(Battle.name) private battleModel: Model<Battle>,
  ) {}

  async find(params: FindBattleEntityParams): Promise<BattleEntity> {
    const battleDocument = await this.battleModel
      .findOne({
        ...(params.ownerId && { ownerId: new ObjectId(params.ownerId) }),
        ...(params.offerId && { offerId: new ObjectId(params.offerId) }),
        ...(params.displayId && { displayId: params.displayId }),
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
    const payload: Partial<BattleEntity> = {
      ...params,
      displayId: nanoid(),
      players: [{
        userId: params.ownerId,
        points: 0,
      }],
    };

    const portfolioDocument = await this.battleModel.create(payload);

    return this.getPopulatedBattleByDisplayId(portfolioDocument.displayId);
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

    return document && this.getPopulatedBattleByDisplayId(document.displayId);
  }

  async findAllByOfferId(offerId: string): Promise<BattleEntity[]> {
    const battleDocuments = await this.battleModel
      .find({
        offerId: new ObjectId(offerId),
      })
      .lean()
      .exec();

    return battleDocuments.map((battleDocument) => {
      return new MongoBattleEntity(battleDocument).getBattle();
    });
  }

  private async getPopulatedBattleByDisplayId(displayId: string) {
    return await this.find({ displayId });
  }
}
