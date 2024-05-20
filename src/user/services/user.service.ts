import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@user/repositories';
import { InjectUserRepository } from '@user/decorators';
import { UserEntity } from '@user/entities';

export interface CreateUserParams {
  fid: number;
  name?: string;
  imageUrl?: string;
  balance?: number;
}

export interface UpdateUserParams {
  name?: string;
  imageUrl?: string;
  balance?: number;
  addPoints?: number;
}

export interface UserService {
  getById(id: string): Promise<UserEntity | null>;
  getByFid(fid: number): Promise<UserEntity | null>;
  getByFidIfExists(fid: number): Promise<UserEntity>;
  create(params: CreateUserParams): Promise<UserEntity>;
  update(id: string, params: UpdateUserParams): Promise<UserEntity | null>;
}

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(@InjectUserRepository() private readonly userRepository: UserRepository) {}

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
      ...(params.name ? { name: params.name } : {}),
      ...(params.imageUrl ? { imageUrl: params.imageUrl } : {}),
      ...(params.balance !== undefined ? { balance: params.balance } : {}),
      ...(params.addPoints !== undefined ? { addPoints: params.addPoints } : {}),
    });
  }
}
