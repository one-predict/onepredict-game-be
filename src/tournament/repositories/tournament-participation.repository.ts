import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gt, Match, Or } from '@common/data/aggregations';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { TournamentParticipation } from '@tournament/schemas';
import { MongoTournamentParticipationEntity } from '@tournament/entities';

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
  findByUserIdAndTournamentId(userId: string, tournamentId: string): Promise<MongoTournamentParticipationEntity | null>;
  existsByTournamentIdAndUserId(tournamentId: string, userId: string): Promise<boolean>;
  create(params: CreateTournamentParticipationEntityParams): Promise<MongoTournamentParticipationEntity>;
  getLeaderboard(tournamentId: string): Promise<TournamentLeaderboard>;
  bulkAddPoints(tournamentIds: string[], userId: string, points: number): Promise<void>;
  getRank(tournamentId: string, userId: string): Promise<number>;
}

@Injectable()
export class MongodbTournamentParticipationRepository implements TournamentParticipationRepository {
  public constructor(
    @InjectModel(TournamentParticipation.name)
    private tournamentParticipationModel: Model<TournamentParticipation>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByUserIdAndTournamentId(userId: string, tournamentId: string) {
    const tournamentParticipationDocument = await this.tournamentParticipationModel
      .findOne(
        {
          user: new ObjectId(userId),
          tournament: new ObjectId(tournamentId),
        },
        undefined,
        { session: this.transactionsManager.getSession() },
      )
      .lean()
      .exec();

    return tournamentParticipationDocument && new MongoTournamentParticipationEntity(tournamentParticipationDocument);
  }

  public async existsByTournamentIdAndUserId(tournamentId: string, userId: string) {
    return (await this.tournamentParticipationModel
      .exists({
        user: new ObjectId(userId),
        tournament: new ObjectId(tournamentId),
      })
      .session(this.transactionsManager.getSession())
      .exec()) as unknown as Promise<boolean>;
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
        Match(Or([{ points: Gt(participation.points) }, { points: participation.points, _id: Gt(participation._id) }])),
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

  public async bulkAddPoints(tournamentIds: string[], userId: string, points: number) {
    await this.tournamentParticipationModel
      .updateOne(
        {
          tournament: { $in: tournamentIds.map((id) => new ObjectId(id)) },
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
