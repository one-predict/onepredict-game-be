import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getCurrentUnixTimestamp } from '@common/utils';
import { GameCardId, removeCardsFromStack, addCardsToStack, getStackSize } from '@card';
import { InjectUserInventoryService, UserInventoryEntity, UserInventoryService } from '@inventory';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectTournamentDeckRepository, InjectTournamentRepository } from '@tournament/decorators';
import { TournamentDeckRepository, TournamentRepository } from '@tournament/repositories';
import { TournamentDeckEntity, TournamentEntity } from '@tournament/entities';

export interface CreateTournamentDeckParams {
  userId: string;
  tournamentId: string;
}

export interface UpdateTournamentDeckParams {
  cardsStack?: Record<string, number>;
}

export interface UpdateUserDeckUsedCardsParams {
  round: number;
  cardsStack: Record<string, number>;
}

export interface TournamentDeckService {
  getUserDeckForTournament(userId: string, tournamentId: string): Promise<TournamentDeckEntity | null>;
  getById(id: string): Promise<TournamentDeckEntity | null>;
  getByIdIfExists(id: string): Promise<TournamentDeckEntity>;
  create(params: CreateTournamentDeckParams): Promise<TournamentDeckEntity>;
  update(id: string, params: UpdateTournamentDeckParams): Promise<TournamentDeckEntity>;
  updateUserDeckUsedCards(
    userId: string,
    tournamentId: string,
    params: UpdateUserDeckUsedCardsParams,
  ): Promise<TournamentDeckEntity>;
}

@Injectable()
export class TournamentDeckServiceImpl implements TournamentDeckService {
  private MAX_CARDS_WITH_SAME_ID = 2;

  constructor(
    @InjectUserInventoryService() private readonly userInventoryService: UserInventoryService,
    @InjectTournamentDeckRepository() private readonly tournamentDeckRepository: TournamentDeckRepository,
    @InjectTournamentRepository() private readonly tournamentRepository: TournamentRepository,
    @InjectTransactionsManager() private readonly transactionManager: TransactionsManager,
  ) {}

  public getUserDeckForTournament(userId: string, tournamentId: string) {
    return this.tournamentDeckRepository.findByUserIdAndTournamentId(userId, tournamentId);
  }

  public getById(id: string) {
    return this.tournamentDeckRepository.findById(id);
  }

  public async getByIdIfExists(id: string) {
    const deck = this.getById(id);

    if (!deck) {
      throw new NotFoundException('Deck is not found.');
    }

    return deck;
  }

  public async create(params: CreateTournamentDeckParams) {
    return this.tournamentDeckRepository.createOne({
      user: params.userId,
      cardsStack: {},
      tournament: params.tournamentId,
      totalDeckSize: 0,
      usedCardsStackByRound: {},
      allUsedCardsStack: {},
    });
  }

  public async update(id: string, params: UpdateTournamentDeckParams) {
    return this.transactionManager.useTransaction(async () => {
      const deck = await this.getByIdIfExists(id);

      if (params.cardsStack) {
        const tournament = await this.loadTournament(deck.getTournamentId());
        const inventory = await this.loadUserInventory(deck.getUserId());

        await this.validateCanUpdateAvailableDeckCards(tournament);
        await this.validateCanAddCardsToDeck(params.cardsStack, inventory);
      }

      const updatedDeck = await this.tournamentDeckRepository.updateOneById(id, {
        ...(params.cardsStack
          ? {
              cardsStack: params.cardsStack,
              totalDeckSize: getStackSize(params.cardsStack),
            }
          : {}),
      });

      if (!updatedDeck) {
        throw new NotFoundException('Deck is not found.');
      }

      return updatedDeck;
    });
  }

  public async updateUserDeckUsedCards(userId: string, tournamentId: string, params: UpdateUserDeckUsedCardsParams) {
    return this.transactionManager.useTransaction(async () => {
      const deck = await this.getUserDeckForTournament(userId, tournamentId);

      if (!deck) {
        throw new UnprocessableEntityException("User doesn't have deck in this tournament");
      }

      const usedCardsStackByRound = deck.getUsedCardsStackByRound();
      const allUsedCardsStack = deck.getAllUsedCardsStack();

      const updatedAllUsedCardsStack = addCardsToStack(
        removeCardsFromStack(allUsedCardsStack, usedCardsStackByRound[params.round] || {}),
        params.cardsStack,
      );

      await this.validateAllUsedCardsStack(deck.getCardsStack(), updatedAllUsedCardsStack);

      const updatedDeck = await this.tournamentDeckRepository.updateOneById(deck.getId(), {
        allUsedCardsStack: updatedAllUsedCardsStack,
        usedCardsStackByRound: {
          [params.round]: params.cardsStack,
        },
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

  private async loadTournament(tournamentId: string) {
    const tournament = await this.tournamentRepository.findById(tournamentId);

    if (!tournament) {
      throw new UnprocessableEntityException(`Provided tournament doesn't exist.`);
    }

    return tournament;
  }

  private async validateCanUpdateAvailableDeckCards(tournament: TournamentEntity) {
    const currentTimestamp = getCurrentUnixTimestamp();

    if (currentTimestamp >= tournament.getStartTimestamp()) {
      throw new UnprocessableEntityException(`You can't update deck cards after the tournament has started.`);
    }
  }

  private async validateCanAddCardsToDeck(cardsStack: Record<string, number>, inventory: UserInventoryEntity) {
    const totalCardsCount = Object.values(cardsStack).reduce((previousCount, count) => previousCount + count, 0);

    if (totalCardsCount > inventory.getAvailableCardSlots()) {
      throw new UnprocessableEntityException('Not enough available card slots.');
    }

    const inventoryCardIds = inventory.getPurchasedCardIds();

    for (const cardId in cardsStack) {
      if (!inventoryCardIds.includes(cardId as GameCardId)) {
        throw new UnprocessableEntityException(`Card ${cardId} is not purchased.`);
      }

      const cardCount = cardsStack[cardId];

      if (cardCount > this.MAX_CARDS_WITH_SAME_ID) {
        throw new UnprocessableEntityException(`Too many cards with ${cardId} id.`);
      }
    }
  }

  private validateAllUsedCardsStack(cardsStack: Record<string, number>, allUsedCardsStack: Record<string, number>) {
    for (const cardId in cardsStack) {
      if (allUsedCardsStack[cardId] > cardsStack[cardId]) {
        throw new UnprocessableEntityException(`${cardId} is used more than available for this deck.`);
      }
    }
  }
}
