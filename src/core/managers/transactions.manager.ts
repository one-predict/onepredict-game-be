import { uniqueId } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { ClientSession, Connection } from 'mongoose';
import { AsyncLocalStorage } from 'async_hooks';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectSessionsAsyncStorage } from '@core/decorators';

interface ITransactionOptions {
  forceNewSession: true;
}

export interface TransactionsManager {
  useTransaction<Response>(callback: () => Promise<Response>, options?: ITransactionOptions): Promise<Response>;
  useSuccessfulCommitEffect(effect: () => Promise<void>): Promise<void>;
  getSession(sessionId?: string | undefined): ClientSession | undefined;
}

type TransactionSession = {
  [id in string]: ClientSession;
};

@Injectable()
export class MongodbTransactionsManager implements TransactionsManager {
  constructor(
    @InjectSessionsAsyncStorage() private sessionsAsyncLocalStorage: AsyncLocalStorage<string>,
    @InjectConnection() private connection: Connection,
  ) {}

  private sessions: TransactionSession = {};
  private successfulCommitEffectsBySessionId: Record<string, Array<() => Promise<void>>> = {};

  public async useTransaction<Response>(callback: () => Promise<Response>, options?: ITransactionOptions) {
    const existingSessionId = !options?.forceNewSession ? this.getCurrentSessionId() : undefined;

    if (existingSessionId) {
      return callback();
    }

    const session = await this.connection.startSession();

    let response: Response;

    const uuid = uniqueId();

    this.sessions[uuid] = session;

    return this.sessionsAsyncLocalStorage.run(uuid, async () => {
      try {
        await session.withTransaction(async () => {
          // Clear effects if retry happens
          delete this.successfulCommitEffectsBySessionId[uuid];

          response = await callback();
        });

        // Do not await effects, they should happen independently of transaction
        this.runSuccessfulCommitEffects(uuid).catch((err) => {
          Logger.error(`Transaction effect error for session ${uuid}: ${err.message}`);
        });

        return response!;
      } finally {
        delete this.sessions[uuid];
        delete this.successfulCommitEffectsBySessionId[uuid];

        session.endSession();
      }
    });
  }

  public async useSuccessfulCommitEffect(effect: () => Promise<void>) {
    const sessionId = this.getCurrentSessionId();

    // Apply effect immediately if sessionId is undefined or session is not registered.
    if (!sessionId || !this.sessions[sessionId]) {
      await effect();

      return;
    }

    if (!this.successfulCommitEffectsBySessionId[sessionId]) {
      this.successfulCommitEffectsBySessionId[sessionId] = [];
    }

    this.successfulCommitEffectsBySessionId[sessionId].push(effect);
  }

  private async runSuccessfulCommitEffects(sessionId: string) {
    const effects = this.successfulCommitEffectsBySessionId[sessionId];

    if (!effects?.length) {
      return;
    }

    for (const effect of effects) {
      try {
        await effect();
      } catch (error) {
        Logger.error(`Transaction effect error for session ${sessionId}: ${error.message}`);
      }
    }
  }

  public getSession(sessionId?: string) {
    return typeof sessionId === 'undefined'
      ? this.sessions[this.sessionsAsyncLocalStorage.getStore()!]
      : this.sessions[sessionId];
  }

  private getCurrentSessionId() {
    return this.sessionsAsyncLocalStorage.getStore();
  }
}
