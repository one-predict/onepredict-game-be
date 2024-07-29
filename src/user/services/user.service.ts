import { round } from 'lodash';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { UserRepository } from '@user/repositories';
import { InjectUserRepository } from '@user/decorators';
import { UserEntity } from '@user/entities';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';

export interface CreateUserParams {
  fid: number;
  username?: string;
  imageUrl?: string;
  coinsBalance?: number;
}

export interface UpdateUserParams {
  username?: string;
  imageUrl?: string;
}

export interface UserService {
  getById(id: string): Promise<UserEntity | null>;
  getByFid(fid: number): Promise<UserEntity | null>;
  getByFidIfExists(fid: number): Promise<UserEntity>;
  create(params: CreateUserParams): Promise<UserEntity>;
  update(id: string, params: UpdateUserParams): Promise<UserEntity | null>;
  withdrawCoins(userId: string, coins: number): Promise<void>;
  addCoins(userId: string, coins: number): Promise<void>;
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

  public getByFid(fid: number) {
    return this.userRepository.findByFid(fid);
  }

  public async getByFidIfExists(fid: number) {
    const user = await this.getByFid(fid);

    if (!user) {
      throw new NotFoundException('User is not found.');
    }

    return user;
  }

  public async create(params: CreateUserParams) {
    return this.userRepository.create(params);
  }

  public update(id: string, params: UpdateUserParams) {
    return this.userRepository.updateById(id, {
      ...(params.username ? { name: params.username } : {}),
      ...(params.imageUrl ? { imageUrl: params.imageUrl } : {}),
    });
  }

  public async addCoins(userId: string, coins: number) {
    await this.transactionsManager.useTransaction(async () => {
      const user = await this.getById(userId);

      if (!user) {
        throw new UnprocessableEntityException('Provided user is not found.');
      }

      await this.userRepository.updateById(userId, {
        coinsBalance: round(user.getCoinsBalance() + coins, 2),
      });
    });
  }

  public async withdrawCoins(userId: string, coins: number) {
    await this.transactionsManager.useTransaction(async () => {
      const user = await this.getById(userId);

      if (!user) {
        throw new UnprocessableEntityException('Provided user is not found.');
      }

      if (user.getCoinsBalance() < coins) {
        throw new UnprocessableEntityException('Not enough balance');
      }

      await this.userRepository.updateById(userId, {
        coinsBalance: round(user.getCoinsBalance() - coins, 2),
      });
    });
  }
}
