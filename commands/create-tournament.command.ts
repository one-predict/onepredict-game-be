import { sampleSize } from 'lodash';
import * as Joi from 'joi';
import mongoose from 'mongoose';
import { Command, CommandRunner } from 'nest-commander';
import * as fs from 'fs';

interface TournamentConfig {
  title: string;
  description: string;
  image_url: string;
  entry_price: number;
  round_duration_in_seconds: number;
  start_timestamp: number;
  rounds: number;
  static_prize_pool?: number;
}

@Command({
  name: 'create-tournament',
  arguments: '<database-url> <path>',
})
export class CreateTournamentCommand extends CommandRunner {
  private readonly SECONDS_IN_HOUR = 3600;
  private readonly MAX_TOKENS_PER_OFFER = 6;
  private readonly AVAILABLE_TOKENS = [
    'aptos',
    'arbitrum',
    'avalanche',
    'axie',
    'bitcoin',
    'bnb',
    'celestia',
    'chia',
    'cosmos',
    'dogecoin',
    'ethereum',
    'fantom',
    'jupiter',
    'litecoin',
    'mantle',
    'near',
    'optimism',
    'polkadot',
    'polygon',
    'shiba-inu',
    'solana',
    'starknet',
    'toncoin',
    'wormhole',
    'xrp'
  ];

  private readonly TOURNAMENT_COLLECTION_NAME = 'tournaments';
  private readonly OFFER_COLLECTION_NAME = 'tokens_offers';

  private readonly CONFIG_VALIDATION_SCHEMA = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image_url: Joi.string().required(),
    rounds: Joi.number().required(),
    entry_price: Joi.number().required(),
    round_duration_in_seconds: Joi.number().required().min(3600),
    start_timestamp: Joi.number().required(),
    static_prize_pool: Joi.number().optional(),
  });

  public async run(inputs: string[]) {
    const [databaseUrl, path] = inputs;

    const config = this.readConfig(path);

    this.validateConfig(config);

    const startTimestamp = Math.floor(config.start_timestamp / this.SECONDS_IN_HOUR) * this.SECONDS_IN_HOUR;

    const databaseConnection = await mongoose.connect(databaseUrl);
    const session = await databaseConnection.startSession();

    try {
      await session.withTransaction(async () => {
        const insertionResult = await databaseConnection.connection.collection(this.TOURNAMENT_COLLECTION_NAME).insertOne({
          title: config.title,
          description: config.description,
          imageUrl: config.image_url,
          entryPrice: config.entry_price,
          staticPrizePool: config.static_prize_pool || 0,
          participantsCount: 0,
          startTimestamp: startTimestamp,
          endTimestamp: startTimestamp + ((config.rounds + 1) * config.round_duration_in_seconds),
          roundDurationInSeconds: config.round_duration_in_seconds,
          __v: 0,
        }, {
          session,
        });

        const tokenOffers = new Array(config.rounds).fill(null).map((key, round) => {
          const timestamp = startTimestamp + ((round + 1) * config.round_duration_in_seconds);

          return {
            timestamp,
            tokens: sampleSize(this.AVAILABLE_TOKENS, this.MAX_TOKENS_PER_OFFER),
            opensAfterTimestamp: timestamp - config.round_duration_in_seconds,
            durationInSeconds: config.round_duration_in_seconds,
            tournament: insertionResult.insertedId,
            __v: 0,
          };
        });

        await databaseConnection.connection.collection(this.OFFER_COLLECTION_NAME).insertMany(tokenOffers, {
          session,
        });
      });
    } finally {
      await session.endSession();
      await databaseConnection.disconnect();
    }
  }

  private readConfig(path: string) {
    const file = fs.readFileSync(path);

    return JSON.parse(file.toString());
  }

  private validateConfig(config: unknown): asserts config is TournamentConfig {
    const validationResult = this.CONFIG_VALIDATION_SCHEMA.validate(config);

    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  }
}
