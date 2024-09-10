import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { TokensOffer } from '@offer/schemas';

export interface TokensOfferEntity {
  getId(): string;
  getTournamentId(): string | null;
  getTimestamp(): number;
  getOpensAfterTimestamp(): number;
  getDurationInSeconds(): number;
  getTokens(): string[];
}

export class MongoTokensOfferEntity implements TokensOfferEntity {
  constructor(private readonly tokenOfferDocument: FlattenMaps<TokensOffer> & { _id: ObjectId }) {}

  public getId() {
    return this.tokenOfferDocument._id.toString();
  }

  public getTimestamp() {
    return this.tokenOfferDocument.timestamp;
  }

  public getOpensAfterTimestamp() {
    return this.tokenOfferDocument.opensAfterTimestamp;
  }

  public getDurationInSeconds() {
    return this.tokenOfferDocument.durationInSeconds;
  }

  public getTournamentId() {
    return this.tokenOfferDocument.tournament?.toString() ?? null;
  }

  public getTokens() {
    return this.tokenOfferDocument.tokens;
  }
}
