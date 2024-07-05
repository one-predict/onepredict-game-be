import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Tournament } from '@tournament/schemas';

export interface TournamentEntity {
  getId(): string;
  getDisplayId(): number;
  getTitle(): string;
  getDescription(): string;
  getEntryPrice(): number;
  getStaticPrizePool(): number;
  getParticipantsCount(): number;
  getStartDay(): number;
  getEndDay(): number;
}

export class MongoTournamentEntity implements TournamentEntity {
  constructor(private readonly tournamentDocument: FlattenMaps<Tournament> & { _id: ObjectId }) {}

  public getId() {
    return this.tournamentDocument._id.toString();
  }

  public getTitle() {
    return this.tournamentDocument.title;
  }

  public getDisplayId() {
    return this.tournamentDocument.displayId;
  }

  public getDescription() {
    return this.tournamentDocument.description;
  }

  public getEntryPrice() {
    return this.tournamentDocument.entryPrice;
  }

  public getStaticPrizePool() {
    return this.tournamentDocument.staticPrizePool;
  }

  public getParticipantsCount() {
    return this.tournamentDocument.participantsCount;
  }

  public getStartDay() {
    return this.tournamentDocument.startDay;
  }

  public getEndDay() {
    return this.tournamentDocument.endDay;
  }
}
