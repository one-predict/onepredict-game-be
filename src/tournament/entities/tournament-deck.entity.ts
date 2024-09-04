import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { TournamentDeck } from '@tournament/schemas';

export interface TournamentDeckEntity {
  getId(): string;
  getUserId(): string;
  getTournamentId(): string;
  getTotalDeckSize(): number;
  getCardsStack(): Record<string, number>;
  getUsedCardsStackByRound(): Record<number, Record<string, number>>;
  getAllUsedCardsStack(): Record<string, number>;
}

export class MongoTournamentDeckEntity implements TournamentDeckEntity {
  constructor(private readonly tournamentDeckDocument: FlattenMaps<TournamentDeck> & { _id: ObjectId }) {}

  public getId() {
    return this.tournamentDeckDocument._id.toString();
  }

  public getUserId() {
    return this.tournamentDeckDocument.user.toString();
  }

  public getTotalDeckSize() {
    return this.tournamentDeckDocument.totalDeckSize;
  }

  public getTournamentId() {
    return this.tournamentDeckDocument.tournament.toString();
  }

  public getCardsStack() {
    return this.tournamentDeckDocument.cardsStack;
  }

  public getUsedCardsStackByRound() {
    return this.tournamentDeckDocument.usedCardsStackByRound;
  }

  public getAllUsedCardsStack() {
    return this.tournamentDeckDocument.allUsedCardsStack;
  }
}
