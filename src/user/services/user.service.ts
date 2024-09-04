import { round } from 'lodash';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionsManager, InjectTransactionsManager } from '@core';
import { InjectUserInventoryService, UserInventoryService } from '@inventory';
import { UserRepository } from '@user/repositories';
import { InjectUserRepository } from '@user/decorators';
import { UserEntity } from '@user/entities';
import { ExternalUserType } from '@user/enums';

export interface CreateUserParams {
  externalId: string | number;
  externalType: ExternalUserType;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  coinsBalance?: number;
  referralId?: string | null;
}

export interface UpdateUserParams {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  onboarded?: boolean;
}

export type Referal = UserEntity & {
  referalsCount: number;
}

export interface UserService {
  getById(id: string): Promise<UserEntity | null>;
  getByExternalId(externalId: string | number): Promise<UserEntity | null>;
  getByExternalIdIfExists(externalId: string | number): Promise<UserEntity>;
  create(params: CreateUserParams): Promise<UserEntity>;
  update(id: string, params: UpdateUserParams): Promise<UserEntity>;
  withdrawCoins(id: string, coins: number): Promise<void>;
  addCoins(id: string, coins: number): Promise<void>;
  getReferals(userId: string): Promise<Referal[] | null>
}

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(
    @InjectUserInventoryService() private readonly userInventoryService: UserInventoryService,
    @InjectUserRepository() private readonly userRepository: UserRepository,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) { }

  public getById(id: string) {
    return this.userRepository.findById(id);
  }

  public getByExternalId(externalId: string | number) {
    return this.userRepository.findByExternalId(externalId);
  }

  public async getByExternalIdIfExists(externalId: string | number) {
    const user = await this.getByExternalId(externalId);

    if (!user) {
      throw new NotFoundException('User is not found.');
    }

    return user;
  }

  public async create(params: CreateUserParams) {
    return this.transactionsManager.useTransaction(async () => {
      const user = await this.userRepository.create({
        externalId: params.externalId,
        externalType: params.externalType,
        coinsBalance: params.coinsBalance,
        username: params.username,
        firstName: params.firstName,
        lastName: params.lastName,
        avatarUrl: params.avatarUrl,
        referrer: params.referralId,
      });

      await this.userInventoryService.create({ userId: user.getId() });

      return user;
    });
  }

  public async update(id: string, params: UpdateUserParams) {
    const user = await this.userRepository.updateById(id, {
      ...(params.username ? { name: params.username } : {}),
      ...(params.firstName ? { firstName: params.firstName } : {}),
      ...(params.lastName ? { lastName: params.lastName } : {}),
      ...(params.avatarUrl ? { avatarUrl: params.avatarUrl } : {}),
      ...(params.onboarded !== undefined ? { onboarded: params.onboarded } : {}),
    });

    if (!user) {
      throw new NotFoundException('User is not found.');
    }

    return user;
  }

  public async addCoins(id: string, coins: number) {
    await this.transactionsManager.useTransaction(async () => {
      const user = await this.getById(id);

      if (!user) {
        throw new UnprocessableEntityException('Provided user is not found.');
      }

      await this.userRepository.updateById(id, {
        coinsBalance: round(user.getCoinsBalance() + coins, 2),
      });
    });
  }

  public async withdrawCoins(id: string, coins: number) {
    await this.transactionsManager.useTransaction(async () => {
      const user = await this.getById(id);

      if (!user) {
        throw new UnprocessableEntityException('Provided user is not found.');
      }

      if (user.getCoinsBalance() < coins) {
        throw new UnprocessableEntityException('Not enough balance');
      }

      await this.userRepository.updateById(id, {
        coinsBalance: round(user.getCoinsBalance() - coins, 2),
      });
    });
  }

  public async getReferals(id: string) {
    return await this.transactionsManager.useTransaction(async () => {
      const user = await this.getById(id);

      if (!user) {
        throw new UnprocessableEntityException('Provided user is not found.');
      }

      const users = await this.userRepository.getReferals(id);
      const referals: Referal[] = []
      for await (const user of users) {
        const referalsCount = await this.userRepository.getReferalsCount(user.getId())
        const referal = Object.assign(user, { referalsCount })
        referals.push(referal)
      }

      return referals
    });
  }
}
