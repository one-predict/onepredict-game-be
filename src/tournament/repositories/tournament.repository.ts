import { ObjectId } from 'mongodb';
import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MatchRange } from '@common/data/aggregations';
import { FindEntitiesQuery } from '@common/types';
import { transformSortArrayToSortObject } from '@common/utils';
import { TransactionsManager, InjectTransactionsManager } from '@core';
import { Tournament } from '@tournament/schemas';
import { MongoTournamentEntity, TournamentEntity } from '@tournament/entities';
import { TournamentSortingField } from '@tournament/enums';

export type FindTournamentEntitiesQuery = FindEntitiesQuery<
  {
    startsAfter?: number;
    startsBefore?: number;
    endsAfter?: number;
    endsBefore?: number;
  },
  TournamentSortingField
>;

export interface TournamentRepository {
  find(query: FindTournamentEntitiesQuery): Promise<TournamentEntity[]>;
  findById(id: string): Promise<TournamentEntity>;
  incrementParticipantsCount(tournamentId: string): Promise<void>;
}

@Injectable()
export class MongoTournamentRepository implements TournamentRepository {
  public constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<Tournament>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindTournamentEntitiesQuery) {
    const mongodbQueryFilter: FilterQuery<Tournament> = {};

    if (query.filter.startsAfter || query.filter.startsBefore) {
      mongodbQueryFilter.startTimestamp = MatchRange(query.filter.startsAfter, query.filter.startsBefore);
    }

    if (query.filter.endsAfter || query.filter.endsBefore) {
      mongodbQueryFilter.endTimestamp = MatchRange(query.filter.endsAfter, query.filter.endsBefore);
    }

    const tournamentDocuments = await this.tournamentModel
      .find(mongodbQueryFilter, undefined, {
        lean: true,
        limit: query.limit,
        skip: query.skip,
        sort: query.sort && transformSortArrayToSortObject(query.sort),
        session: this.transactionsManager.getSession(),
      })
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

  public async incrementParticipantsCount(tournamentId: string) {
    await this.tournamentModel.updateOne(
      { _id: new ObjectId(tournamentId) },
      { $inc: { participantsCount: 1 } },
      { session: this.transactionsManager.getSession() },
    );
  }
}
