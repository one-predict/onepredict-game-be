require('dotenv').config();

import { keyPairFromSeed } from 'tonweb/src/utils';
import HttpProvider from 'tonweb/src/providers';
import { validateMnemonic, mnemonicToSeed } from 'tonweb-mnemonic';
import { sampleSize } from 'lodash';

import * as Joi from 'joi';
import mongoose from 'mongoose';
import { Command, CommandRunner } from 'nest-commander';
import * as fs from 'fs';
import { MongoTournamentEntity } from '@tournament/entities';
import { ObjectId } from 'mongodb';
const TonWeb = require('tonweb');

const seedPhrase = process.env.SEED_PHRASE;
if (!seedPhrase) {
  console.error(`
    🚨🚨🚨 [ERROR] SEED_PHRASE Missing! 🚨🚨🚨
    It looks like you forgot to add the SEED_PHRASE to your .env file.
    Please create a .env file in the root directory and add the following line:
    
    SEED_PHRASE="your seed phrase here"
    
    After that, try running the script again. Good luck!
    `);
  process.exit(1);
}

const tonweb = new TonWeb(
  new HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
    apiKey: process.env.TONCENTER_API_KEY,
  }),
);

const words = seedPhrase.split(' ');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendTransaction = async (toAddress: string, amount: number) => {
  try {
    const seed = await mnemonicToSeed(words);

    const keyPair = keyPairFromSeed(seed);

    const wallet = tonweb.wallet.create({
      publicKey: keyPair.publicKey,
      mnemonic: seedPhrase,
    });

    const roundedAmount = Math.round(amount * 1000000000);

    const transferMessage = await wallet.methods
      .transfer({
        toAddress: toAddress,
        amount: `${roundedAmount}`,
        seqno: (await wallet.methods.seqno().call()) ?? 0,
        secretKey: keyPair.secretKey,
      })
      .send();

    console.log('==================>');
    console.log('To address:', toAddress);
    console.log('Amount:', roundedAmount / 1000000000);
  } catch (error) {
    console.log('SendTransaction error:', error);
  }
};

interface TournamentConfig {
  title: string;
  description: string;
  image_url: string;
  entry_price: number;
  round_duration_in_seconds: number;
  start_timestamp: number;
  rounds: number;
  static_prize_pool?: number;
  isTonConnected?: boolean;
}

@Command({
  name: 'send-rewards',
  arguments: '<database-url> <tournament-id>',
})
export class SendRewardCommand extends CommandRunner {
  private readonly SECONDS_IN_HOUR = 3600;
  private readonly MAX_TOKENS_PER_OFFER = 6;

  private readonly TOURNAMENT_COLLECTION_NAME = 'tournaments';
  private readonly TOURNAMENT_PARTICIPATIONS_COLLECTION_NAME = 'tournament_participations';
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
    const [databaseUrl, tournamentId] = inputs;

    const getConnection = async () => {
      const databaseConnection = await mongoose.connect(databaseUrl);
      const session = await databaseConnection.startSession();

      return databaseConnection;
    };

    try {
      const data = await (await getConnection()).connection
        .collection(this.TOURNAMENT_COLLECTION_NAME)
        .findOne({ _id: new ObjectId(tournamentId) });

      const overallPrizePool = (data.participantsCount * data.entryPrice + data.staticPrizePool) * 0.8;

      const tournamentParticipations = await (
        await getConnection()
      ).connection
        .collection(this.TOURNAMENT_PARTICIPATIONS_COLLECTION_NAME)
        .find({
          tournament: new ObjectId(tournamentId),
        })
        .sort({
          points: -1,
        });

      const participations = await tournamentParticipations.toArray();

      const allUserPoints = participations.reduce((accumulator, participation) => {
        return accumulator + (participation.points as number);
      }, 0);

      const pointPrise = overallPrizePool / allUserPoints;

      participations.map(async (user) => {
        if (user.points * pointPrise === 0 && !user.walletAddress) {
          return;
        }

        await sendTransaction(user.walletAddress, user.points * pointPrise);

        delay(5000);
      });
    } catch (error) {
      console.log(error.message);
    } finally {
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
