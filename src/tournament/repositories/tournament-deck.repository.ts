import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { GameCardId } from '@card';
import { MongoTournamentDeckEntity, TournamentDeckEntity } from '@tournament/entities';
import { TournamentDeck } from '@tournament/schemas';

export interface CreateTournamentDeckEntityParams {
  user: string;
  tournament: string;
  cards: GameCardId[];
  usedCards: GameCardId[];
}

export interface UpdateTournamentDeckEntityParams {
  cards?: GameCardId[];
  usedCards?: GameCardId[];
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
    const deck = await this.tournamentDeckModel
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        params,
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
