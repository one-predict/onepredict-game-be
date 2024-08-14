import { Injectable } from '@nestjs/common';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectTournamentRepository } from '@tournament/decorators';
import { TournamentEntity } from '@tournament/entities';
import { TournamentRepository } from '@tournament/repositories';

export interface TournamentService {
  addParticipant(tournamentId: string): Promise<void>;
  listLatest(): Promise<TournamentEntity[]>;
  listBetweenDays(startDay: number, endDay): Promise<TournamentEntity[]>;
  getById(id: string): Promise<TournamentEntity | null>;
  getByDisplayId(displayId: number): Promise<TournamentEntity | null>;
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

  public async listLatest() {
    return this.tournamentRepository.findLatest(this.LATEST_TOURNAMENTS_LIMIT);
  }

  public async listBetweenDays(startDay: number, endDay) {
    return this.tournamentRepository.findBetweenDays(startDay, endDay);
  }

  public getById(id: string) {
    return this.tournamentRepository.findById(id);
  }

  public getByDisplayId(displayId: number) {
    return this.tournamentRepository.findByDisplayId(displayId);
  }
}
