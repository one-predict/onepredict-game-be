import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { countBy } from 'lodash';
import { GameCardId } from '@card';
import { InjectUserInventoryService, UserInventoryEntity, UserInventoryService } from '@inventory';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectPortfolioCardsDeckRepository } from '@portfolio/decorators';
import { PortfolioCardsDeckRepository } from '@portfolio/repositories';
import { PortfolioCardsDeckEntity } from '@portfolio/entities';

export interface CreatePortfolioCardsDeckParams {
  userId: string;
  cardIds: GameCardId[];
}

export interface UpdatePortfolioCardsDeckParams {
  cardIds?: GameCardId[];
}

export interface PortfolioCardsDeckService {
  listForUser(userId: string): Promise<PortfolioCardsDeckEntity[]>;
  getById(id: string): Promise<PortfolioCardsDeckEntity | null>;
  getByIdIfExists(id: string): Promise<PortfolioCardsDeckEntity>;
  create(params: CreatePortfolioCardsDeckParams): Promise<PortfolioCardsDeckEntity>;
  update(id: string, params: UpdatePortfolioCardsDeckParams): Promise<PortfolioCardsDeckEntity>;
}

@Injectable()
export class PortfolioCardsDeckServiceImpl implements PortfolioCardsDeckService {
  private MAX_CARDS_WITH_SAME_ID = 2;

  constructor(
    @InjectUserInventoryService() private readonly userInventoryService: UserInventoryService,
    @InjectPortfolioCardsDeckRepository() private readonly portfolioCardsDeckRepository: PortfolioCardsDeckRepository,
    @InjectTransactionsManager() private readonly transactionManager: TransactionsManager,
  ) {}

  public listForUser(userId: string) {
    return this.portfolioCardsDeckRepository.findByUserId(userId);
  }

  public getById(id: string) {
    return this.portfolioCardsDeckRepository.findById(id);
  }

  public async getByIdIfExists(id: string) {
    const deck = this.getById(id);

    if (!deck) {
      throw new NotFoundException('Deck is not found.');
    }

    return deck;
  }

  public async create(params: CreatePortfolioCardsDeckParams) {
    const inventory = await this.loadUserInventory(params.userId);

    await this.validateProvidedGameCards(params.cardIds, inventory);

    return this.portfolioCardsDeckRepository.createOne({
      user: params.userId,
      cards: params.cardIds,
    });
  }

  public async update(id: string, params: UpdatePortfolioCardsDeckParams) {
    return this.transactionManager.useTransaction(async () => {
      const deck = await this.getByIdIfExists(id);

      if (params.cardIds) {
        const inventory = await this.loadUserInventory(deck.getUserId());

        await this.validateProvidedGameCards(params.cardIds, inventory);
      }

      const updatedDeck = await this.portfolioCardsDeckRepository.updateOneById(id, {
        ...(params.cardIds ? { cards: params.cardIds } : {}),
      });

      if (!updatedDeck) {
        throw new NotFoundException('Deck is not found.');
      }

      return updatedDeck;
    });
  }

  private async loadUserInventory(userId: string) {
    const inventory = await this.userInventoryService.getForUser(userId);

    if (!inventory) {
      throw new UnprocessableEntityException('User inventory is not found.');
    }

    return inventory;
  }

  private async validateProvidedGameCards(cardIds: GameCardId[], inventory: UserInventoryEntity) {
    if (cardIds.length > inventory.getAvailableCardSlots()) {
      throw new UnprocessableEntityException('Not enough available card slots.');
    }

    const inventoryCardIds = inventory.getPurchasedCardIds();
    const countedCardIds = countBy(cardIds);

    for (const cardId in countedCardIds) {
      if (!inventoryCardIds.includes(cardId as GameCardId)) {
        throw new UnprocessableEntityException(`Card ${cardId} is not purchased.`);
      }

      const cardCount = countedCardIds[cardId];

      if (cardCount > this.MAX_CARDS_WITH_SAME_ID) {
        throw new UnprocessableEntityException(`Too many cards with ${cardId} id.`);
      }
    }
  }
}
