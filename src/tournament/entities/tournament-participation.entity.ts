import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { TournamentParticipation } from '@tournament/schemas';

export interface TournamentParticipationEntity {
  getId(): string;
  getTournamentId(): string;
  getUserId(): string;
  getPoints(): number;
}

export class MongoTournamentParticipationEntity implements TournamentParticipationEntity {
  constructor(
    private readonly tournamentParticipationDocument: FlattenMaps<TournamentParticipation> & {
      _id: ObjectId;
    },
  ) {}

  public getId() {
    return this.tournamentParticipationDocument._id.toString();
  }

  public getTournamentId() {
    return this.tournamentParticipationDocument.tournament.toString();
  }

  public getUserId() {
    return this.tournamentParticipationDocument.user.toString();
  }

  public getPoints() {
    return this.tournamentParticipationDocument.points;
  }
}
