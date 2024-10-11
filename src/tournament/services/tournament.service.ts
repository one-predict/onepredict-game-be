import { Injectable } from '@nestjs/common';
import { SortDirection } from '@common/enums';
import { getCurrentUnixTimestamp } from '@common/utils';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectTournamentRepository } from '@tournament/decorators';
import { TournamentEntity } from '@tournament/entities';
import { TournamentRepository } from '@tournament/repositories';
import { TournamentSortingField, TournamentStatus } from '@tournament/enums';

export interface TournamentService {
  addParticipant(tournamentId: string): Promise<void>;
  listLatest(status?: TournamentStatus): Promise<TournamentEntity[]>;
  getById(id: string): Promise<TournamentEntity | null>;
}

@Injectable()
export class TournamentServiceImpl implements TournamentService {
  private LATEST_TOURNAMENTS_LIMIT = 30;

  constructor(
    @InjectTournamentRepository() private readonly tournamentRepository: TournamentRepository,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async addParticipant(tournamentId: string) {
    await this.tournamentRepository.incrementParticipantsCount(tournamentId);
  }

  public async listLatest(status?: TournamentStatus) {
    const currentTimestamp = getCurrentUnixTimestamp();

    return this.tournamentRepository.find({
      filter: {
        ...(status === TournamentStatus.Available
          ? {
              endsAfter: currentTimestamp,
            }
          : {}),
        ...(status === TournamentStatus.Finished
          ? {
              endsBefore: currentTimestamp,
            }
          : {}),
      },
      sort: [
        {
          field: TournamentSortingField.StartTimestamp,
          direction: SortDirection.Ascending,
        },
      ],
      limit: this.LATEST_TOURNAMENTS_LIMIT,
    });
  }

  public getById(id: string) {
    return this.tournamentRepository.findById(id);
  }
}
