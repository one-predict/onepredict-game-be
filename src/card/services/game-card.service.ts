import { Injectable } from '@nestjs/common';
import { InjectGameCardRepository } from '@card/decorators';
import { GameCardEntity } from '@card/entities';
import { GameCardRepository } from '@card/repositories';
import { GameCardId } from '@card/enums';

export interface GameCardService {
  list(): Promise<GameCardEntity[]>;
  listForIds(ids: GameCardId[]): Promise<GameCardEntity[]>;
  getById(id: GameCardId): Promise<GameCardEntity>;
}

@Injectable()
export class GameCardServiceImpl implements GameCardService {
  constructor(@InjectGameCardRepository() private readonly gameCardRepository: GameCardRepository) {}

  public list() {
    return this.gameCardRepository.find();
  }

  public listForIds(ids: GameCardId[]) {
    return this.gameCardRepository.findByIds(ids);
  }

  public getById(id: GameCardId) {
    return this.gameCardRepository.findById(id);
  }
}
