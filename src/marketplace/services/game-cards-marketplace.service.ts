import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { GameCardId, GameCardService, InjectGameCardService } from '@card';
import { InjectUserService, UserService } from '@user';
import { InjectUserInventoryService, UserInventoryService } from '@inventory';
import { InjectTransactionsManager, TransactionsManager } from '@core';

export interface PurchaseGameCardParams {
  userId: string;
  cardId: GameCardId;
}

export interface GameCardsMarketplaceService {
  purchaseGameCard(params: PurchaseGameCardParams): Promise<void>;
}

@Injectable()
export class GameCardsMarketplaceServiceImpl implements GameCardsMarketplaceService {
  constructor(
    @InjectGameCardService() private readonly gameCardService: GameCardService,
    @InjectUserService() private readonly userService: UserService,
    @InjectUserInventoryService() private readonly userInventoryService: UserInventoryService,
    @InjectTransactionsManager() private readonly transactionManager: TransactionsManager,
  ) {}

  public async purchaseGameCard(params: PurchaseGameCardParams) {
    const card = await this.gameCardService.getById(params.cardId);

    if (!card) {
      throw new UnprocessableEntityException("Provided card doesn't exists.");
    }

    await this.transactionManager.useTransaction(async () => {
      await this.userInventoryService.addCardToUserInventory(params.userId, params.cardId);
      await this.userService.withdrawCoins(params.userId, card.getPrice());
    });
  }
}
