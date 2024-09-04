import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { MongoTournamentDeckEntity, TournamentDeckEntity } from '@tournament/entities';
import { TournamentDeck } from '@tournament/schemas';

export interface CreateTournamentDeckEntityParams {
  user: string;
  tournament: string;
  totalDeckSize: number;
  cardsStack: Record<string, number>;
  usedCardsStackByRound: Record<number, Record<string, number>>;
  allUsedCardsStack: Record<string, number>;
}

export interface UpdateTournamentDeckEntityParams {
  cardsStack?: Record<string, number>;
  usedCardsStackByRound?: Record<number, Record<string, number>>;
  allUsedCardsStack?: Record<string, number>;
  totalDeckSize?: number;
}

export interface TournamentDeckRepository {
  findByUserIdAndTournamentId(userId: string, tournamentId: string): Promise<TournamentDeckEntity>;
  findById(id: string): Promise<TournamentDeckEntity | null>;
  createOne(params: CreateTournamentDeckEntityParams): Promise<TournamentDeckEntity>;
  updateOneById(id: string, params: UpdateTournamentDeckEntityParams): Promise<TournamentDeckEntity | null>;
}

@Injectable()
export class MongoTournamentDeckRepository implements TournamentDeckRepository {
  public constructor(
    @InjectModel(TournamentDeck.name) private tournamentDeckModel: Model<TournamentDeck>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByUserIdAndTournamentId(userId: string, tournamentId: string) {
    const deck = await this.tournamentDeckModel
      .findOne({ user: new ObjectId(userId), tournament: new ObjectId(tournamentId) })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return deck && new MongoTournamentDeckEntity(deck);
  }

  public async findById(id: string) {
    const deck = await this.tournamentDeckModel
      .findOne({
        _id: new ObjectId(id),
      })
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return deck && new MongoTournamentDeckEntity(deck);
  }

  public async createOne(params: CreateTournamentDeckEntityParams) {
    const [deck] = await this.tournamentDeckModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoTournamentDeckEntity(deck);
  }

  public async updateOneById(id: string, params: UpdateTournamentDeckEntityParams) {
    const { usedCardsStackByRound, ...restParams } = params;

    const usedCardsStackByRoundUpdates = Object.keys(usedCardsStackByRound || {}).reduce((previousUpdates, key) => {
      previousUpdates[`usedCardsStackByRound.${key}`] = usedCardsStackByRound[key];

      return previousUpdates;
    }, {});

    const deck = await this.tournamentDeckModel
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        {
          ...restParams,
          ...usedCardsStackByRoundUpdates,
        },
        {
          new: true,
          session: this.transactionsManager.getSession(),
        },
      )
      .lean()
      .exec();

    return deck && new MongoTournamentDeckEntity(deck);
  }
}
