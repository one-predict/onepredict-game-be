import { Injectable } from '@nestjs/common';
import { UserRepository } from '@user/repositories';
import { InjectUserRepository } from '@user/decorators';
import { UserEntity } from '@user/entities';

export interface ReferralService {
  list(referrerId: string): Promise<UserEntity[]>;
}

@Injectable()
export class ReferralServiceImpl implements ReferralService {
  constructor(@InjectUserRepository() private readonly userRepository: UserRepository) {}

  public list(referrerId: string) {
    return this.userRepository.find({
      filter: {
        referrerId,
      },
    });
  }
}
