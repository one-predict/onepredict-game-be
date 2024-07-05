import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';
import { TournamentParticipation } from '@tournament/schemas';
import { MongoTournamentParticipationEntity } from '@tournament/entities';
import { Gt, Match, Or } from '@common/data/aggregations';

export interface CreateTournamentParticipationEntityParams {
  user: string;
  tournament: string;
  points: number;
}

export interface TournamentParticipationRepository {
  findByUserIdAndTournamentId(
    userId: string,
    tournamentId: string,
  ): Promise<MongoTournamentParticipationEntity | null>;
  existsByTournamentIdAndUserId(tournamentId: string, userId: string): Promise<boolean>;
  create(params: CreateTournamentParticipationEntityParams): Promise<MongoTournamentParticipationEntity>;
  bulkAddPoints(participationIds: string[], points: number): Promise<void>;
  getRank(tournamentId: string, userId: string): Promise<number>;
}

@Injectable()
export class MongodbTournamentParticipationRepository implements TournamentParticipationRepository {
  public constructor(
    @InjectModel(TournamentParticipation.name)
    private tournamentParticipationModel: Model<TournamentParticipation>,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
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

    return (
      tournamentParticipationDocument &&
      new MongoTournamentParticipationEntity(tournamentParticipationDocument)
    );
  }

  public async existsByTournamentIdAndUserId(tournamentId: string, userId: string) {
    return await this.tournamentParticipationModel.exists({
      user: new ObjectId(userId),
      tournament: new ObjectId(tournamentId),
    }).session(this.transactionsManager.getSession()).exec() as unknown as Promise<boolean>;
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
            { points: Gt(participation.points) },
            { points: participation.points, _id: Gt(participation._id) },
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

  public async bulkAddPoints(participationIds: string[], points: number) {
    await this.tournamentParticipationModel
      .updateOne(
        {
          _id: { $in: participationIds.map((id) => new ObjectId(id)) },
        },
        {
          $inc: { points },
        },
        {
          session: this.transactionsManager.getSession(),
        },
      )
      .lean()
      .exec();
  }
}
