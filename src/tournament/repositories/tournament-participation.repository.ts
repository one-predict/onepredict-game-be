import { ObjectId } from 'mongodb';
import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gt, Match, Or } from '@common/data/aggregations';
import { FindEntitiesQuery } from '@common/types';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { TournamentParticipation } from '@tournament/schemas';
import { MongoTournamentParticipationEntity } from '@tournament/entities';
import { transformSortArrayToSortObject } from '@common/utils';

export type FindTournamentParticipationEntitiesQuery = FindEntitiesQuery<{
  userId?: string;
  tournamentId?: string;
}>;

export interface CreateTournamentParticipationEntityParams {
  user: string;
  tournament: string;
  points: number;
}

export interface TournamentLeaderboard {
  rankedParticipants: Array<{
    id: string;
    username: string;
    imageUrl: string;
    points: number;
  }>;
}

export interface TournamentParticipationRepository {
  find(query: FindTournamentParticipationEntitiesQuery): Promise<MongoTournamentParticipationEntity[]>;
  create(params: CreateTournamentParticipationEntityParams): Promise<MongoTournamentParticipationEntity>;
  addPoints(userId: string, tournamentId: string, points: number): Promise<void>;
  getLeaderboard(tournamentId: string): Promise<TournamentLeaderboard>;
  getRank(tournamentId: string, userId: string): Promise<number>;
}

@Injectable()
export class MongodbTournamentParticipationRepository implements TournamentParticipationRepository {
  public constructor(
    @InjectModel(TournamentParticipation.name)
    private tournamentParticipationModel: Model<TournamentParticipation>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindTournamentParticipationEntitiesQuery) {
    const mongodbQueryFilter: FilterQuery<TournamentParticipation> = {};

    if (query.filter.userId) {
      mongodbQueryFilter.user = new ObjectId(query.filter.userId);
    }

    if (query.filter.tournamentId) {
      mongodbQueryFilter.tournament = new ObjectId(query.filter.tournamentId);
    }

    const tournamentParticipationDocuments = await this.tournamentParticipationModel
      .find(mongodbQueryFilter, undefined, {
        lean: true,
        limit: query.limit,
        skip: query.skip,
        sort: query.sort && transformSortArrayToSortObject(query.sort),
        session: this.transactionsManager.getSession(),
      })
      .exec();

    return tournamentParticipationDocuments.map((tournamentParticipationDocument) => {
      return new MongoTournamentParticipationEntity(tournamentParticipationDocument);
    });
  }

  public async getLeaderboard(tournamentId: string) {
    const participations: Array<{
      _id: ObjectId;
      user: {
        _id: ObjectId;
        username: string;
        imageUrl: string;
      };
      points: number;
    }> = await this.tournamentParticipationModel
      .aggregate([
        { $match: { tournament: new ObjectId(tournamentId) } },
        { $sort: { points: -1, _id: 1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            user: {
              _id: 1,
              username: 1,
              imageUrl: 1,
            },
            points: 1,
          },
        },
      ])
      .exec();

    return {
      rankedParticipants: participations.map((participation) => ({
        id: participation.user._id.toString(),
        username: participation.user.username,
        imageUrl: participation.user.imageUrl,
        points: participation.points,
      })),
    };
  }

  public async getRank(tournamentId: string, userId: string) {
    const participation = await this.tournamentParticipationModel
      .findOne(
        {
          tournament: new ObjectId(tournamentId),
          user: new ObjectId(userId),
        },
        { points: 1, _id: 1 },
      )
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    if (!participation) {
      return 0;
    }

    const [{ summary = 0 } = {}] = await this.tournamentParticipationModel
      .aggregate([
        Match(
          Or([
            { tournament: new ObjectId(tournamentId), points: Gt(participation.points) },
            { tournament: new ObjectId(tournamentId), points: participation.points, _id: Gt(participation._id) },
          ]),
        ),
        { $sort: { points: -1, _id: 1 } },
        { $count: 'summary' },
      ])
      .exec();

    return (summary as number) + 1;
  }

  public async create(params: CreateTournamentParticipationEntityParams) {
    const [tournamentParticipationDocument] = await this.tournamentParticipationModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoTournamentParticipationEntity(tournamentParticipationDocument);
  }

  public async addPoints(userId: string, tournamentId: string, points: number) {
    await this.tournamentParticipationModel
      .updateOne(
        {
          tournament: new ObjectId(tournamentId),
          user: new ObjectId(userId),
        },
        [
          {
            $set: {
              points: {
                $round: [{ $add: ['$points', points] }, 2],
              },
            },
          },
        ],
        {
          session: this.transactionsManager.getSession(),
        },
      )
      .lean()
      .exec();
  }
}
