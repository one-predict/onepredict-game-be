import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TransactionsManager, InjectTransactionsManager } from '@core';
import { Tournament } from '@tournament/schemas';
import { MongoTournamentEntity, TournamentEntity } from '@tournament/entities';

export interface TournamentRepository {
  findLatest(limit: number): Promise<TournamentEntity[]>;
  findBetweenDays(startDay: number, endDay): Promise<TournamentEntity[]>;
  findById(id: string): Promise<TournamentEntity>;
  findByDisplayId(displayId: number): Promise<TournamentEntity>;
  incrementParticipantsCount(tournamentId: string): Promise<void>;
}

@Injectable()
export class MongoTournamentRepository implements TournamentRepository {
  public constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<Tournament>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findLatest(limit: number): Promise<TournamentEntity[]> {
    const tournamentDocuments = await this.tournamentModel
      .find({})
      .sort({ startDay: -1 })
      .limit(limit)
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return tournamentDocuments.map((tournamentDocument) => {
      return new MongoTournamentEntity(tournamentDocument);
    });
  }

  public async findBetweenDays(startDay: number, endDay: number): Promise<TournamentEntity[]> {
    const tournamentDocuments = await this.tournamentModel
      .find({
        $and: [{ startDay: { $lte: new Date(endDay) } }, { endDay: { $gte: new Date(startDay) } }],
      })
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return tournamentDocuments.map((tournamentDocument) => {
      return new MongoTournamentEntity(tournamentDocument);
    });
  }

  public async findById(id: string) {
    const tournament = await this.tournamentModel
      .findOne({
        _id: new ObjectId(id),
      })
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return tournament && new MongoTournamentEntity(tournament);
  }

  public async findByDisplayId(displayId: number) {
    const tournament = await this.tournamentModel
      .findOne({
        displayId,
      })
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return tournament && new MongoTournamentEntity(tournament);
  }

  public async incrementParticipantsCount(tournamentId: string) {
    await this.tournamentModel.updateOne(
      { _id: new ObjectId(tournamentId) },
      { $inc: { participantsCount: 1 } },
      { session: this.transactionsManager.getSession() },
    );
  }
}
