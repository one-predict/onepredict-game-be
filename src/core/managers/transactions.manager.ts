import { uniqueId } from 'lodash';
import { Injectable } from '@nestjs/common';
import { ClientSession, Connection } from 'mongoose';
import { AsyncLocalStorage } from 'async_hooks';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectSessionsAsyncStorage } from '@core/decorators';

interface ITransactionOptions {
  forceNewSession: true;
}

export interface TransactionsManager {
  useTransaction<Response>(
    callback: () => Promise<Response>,
    options?: ITransactionOptions,
  ): Promise<Response>;
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
          response = await callback();
        });

        return response!;
      } finally {
        delete this.sessions[uuid];

        session.endSession();
      }
    });
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
