import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { GameCardId, GameCardService, InjectGameCardService } from '@card';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { UserInventoryEntity } from '@inventory/entities';
import { UserInventoryRepository } from '@inventory/repositories';
import { InjectUserInventoryRepository } from '@inventory/decorators';

export interface CreateUserInventoryParams {
  userId: string;
}

export interface UserInventoryService {
  getForUser(userId: string): Promise<UserInventoryEntity | null>;
  getForUserIfExists(userId: string): Promise<UserInventoryEntity>;
  addCardToUserInventory(userId: string, cardId: GameCardId): Promise<void>;
  create(params: CreateUserInventoryParams): Promise<UserInventoryEntity>;
}

@Injectable()
export class UserInventoryServiceImpl implements UserInventoryService {
  constructor(
    @InjectGameCardService() private readonly gameCardService: GameCardService,
    @InjectUserInventoryRepository() private readonly userInventoryRepository: UserInventoryRepository,
    @InjectTransactionsManager() private readonly transactionManager: TransactionsManager,
  ) {}

  public getForUser(userId: string) {
    return this.userInventoryRepository.findByUserId(userId);
  }

  public async getForUserIfExists(userId: string) {
    const inventory = await this.getForUser(userId);

    if (!inventory) {
      throw new UnprocessableEntityException('User inventory not found.');
    }

    return inventory;
  }

  public async create(params: CreateUserInventoryParams) {
    return this.userInventoryRepository.createOne({
      user: params.userId,
      cards: [],
      perks: [],
    });
  }

  public async addCardToUserInventory(userId: string, cardId: GameCardId) {
    return this.transactionManager.useTransaction(async () => {
      const inventory = await this.getForUser(userId);

      if (!inventory) {
        throw new UnprocessableEntityException('User inventory not found.');
      }

      if (inventory.getPurchasedCardIds().includes(cardId)) {
        throw new UnprocessableEntityException('Provided card already exists in inventory.');
      }

      await this.userInventoryRepository.updateOneById(inventory.getId(), {
        cards: [...inventory.getPurchasedCardIds(), cardId],
      });
    });
  }
}
