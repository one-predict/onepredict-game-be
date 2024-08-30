import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { countBy } from 'lodash';
import { getCurrentUnixTimestamp } from '@common/utils';
import { GameCardId } from '@card';
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
  cardIds?: GameCardId[];
}

export interface UpdateTournamentDeckUsedCardsParams {
  cardIdsToAdd: GameCardId[];
  cardIdsToRemove: GameCardId[];
}

export interface TournamentDeckService {
  getUserDeckForTournament(userId: string, tournamentId: string): Promise<TournamentDeckEntity | null>;
  getById(id: string): Promise<TournamentDeckEntity | null>;
  getByIdIfExists(id: string): Promise<TournamentDeckEntity>;
  create(params: CreateTournamentDeckParams): Promise<TournamentDeckEntity>;
  update(id: string, params: UpdateTournamentDeckParams): Promise<TournamentDeckEntity>;
  updateUsedCards(id: string, params: UpdateTournamentDeckUsedCardsParams): Promise<TournamentDeckEntity>;
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
      cards: [],
      tournament: params.tournamentId,
      usedCards: [],
    });
  }

  public async update(id: string, params: UpdateTournamentDeckParams) {
    return this.transactionManager.useTransaction(async () => {
      const deck = await this.getByIdIfExists(id);

      if (params.cardIds) {
        const tournament = await this.loadTournament(deck.getTournamentId());
        const inventory = await this.loadUserInventory(deck.getUserId());

        await this.validateCanUpdateAvailableDeckCards(tournament);
        await this.validateCanAddCardsToDeck(params.cardIds, inventory);
      }

      const updatedDeck = await this.tournamentDeckRepository.updateOneById(id, {
        ...(params.cardIds ? { cards: params.cardIds } : {}),
      });

      if (!updatedDeck) {
        throw new NotFoundException('Deck is not found.');
      }

      return updatedDeck;
    });
  }

  public async updateUsedCards(id: string) {
    return this.transactionManager.useTransaction(async () => {
      const updatedDeck = await this.tournamentDeckRepository.updateOneById(id, {
        usedCards: [],
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

  private async validateCanAddCardsToDeck(cardIds: GameCardId[], inventory: UserInventoryEntity) {
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
