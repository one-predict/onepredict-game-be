import { round } from 'lodash';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { UserRepository } from '@user/repositories';
import { InjectUserRepository } from '@user/decorators';
import { UserEntity } from '@user/entities';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';
import {ExternalUserType} from "@auth/enums";

export interface CreateUserParams {
  externalId: string | number;
  externalType: ExternalUserType;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  coinsBalance?: number;
}

export interface UpdateUserParams {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface UserService {
  getById(id: string): Promise<UserEntity | null>;
  getByExternalId(externalId: string | number): Promise<UserEntity | null>;
  getByExternalIdIfExists(externalId: string | number): Promise<UserEntity>;
  create(params: CreateUserParams): Promise<UserEntity>;
  update(id: string, params: UpdateUserParams): Promise<UserEntity>;
  withdrawCoins(id: string, coins: number): Promise<void>;
  addCoins(id: string, coins: number): Promise<void>;
}

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(
    @InjectUserRepository() private readonly userRepository: UserRepository,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
  ) {}

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
    return this.userRepository.create(params);
  }

  public async update(id: string, params: UpdateUserParams) {
    const user = await this.userRepository.updateById(id, {
      ...(params.username ? { name: params.username } : {}),
      ...(params.firstName ? { firstName: params.firstName } : {}),
      ...(params.lastName ? { lastName: params.lastName } : {}),
      ...(params.avatarUrl ? { avatarUrl: params.avatarUrl } : {}),
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
}
