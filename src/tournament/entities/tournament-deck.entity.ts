import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { GameCardId } from '@card';
import { TournamentDeck } from '@tournament/schemas';

export interface TournamentDeckEntity {
  getId(): string;
  getUserId(): string;
  getTournamentId(): string;
  getCardIds(): GameCardId[];
}

export class MongoTournamentDeckEntity implements TournamentDeckEntity {
  constructor(private readonly tournamentDeckDocument: FlattenMaps<TournamentDeck> & { _id: ObjectId }) {}

  public getId() {
    return this.tournamentDeckDocument._id.toString();
  }

  public getUserId() {
    return this.tournamentDeckDocument.user.toString();
  }

  public getCardIds() {
    return this.tournamentDeckDocument.cards;
  }

  public getTournamentId() {
    return this.tournamentDeckDocument.tournament.toString();
  }
}
