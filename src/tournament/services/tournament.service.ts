import { Injectable } from '@nestjs/common';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';
import { InjectTournamentRepository } from '@tournament/decorators';
import { TournamentEntity } from '@tournament/entities';
import { TournamentRepository } from '@tournament/repositories';

export interface TournamentService {
  addParticipant(tournamentId: string): Promise<void>;
  listBetweenDays(startDay: number, endDay): Promise<TournamentEntity[]>;
  getById(id: string): Promise<TournamentEntity | null>;
  getByDisplayId(displayId: number): Promise<TournamentEntity | null>;
}

@Injectable()
export class TournamentServiceImpl implements TournamentService {
  constructor(
    @InjectTournamentRepository() private readonly tournamentRepository: TournamentRepository,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async addParticipant(tournamentId: string) {
    await this.tournamentRepository.incrementParticipantsCount(tournamentId);
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
