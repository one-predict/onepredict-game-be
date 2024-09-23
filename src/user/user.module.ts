import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { User, UserSchema } from '@user/schemas';
import { UserServiceImpl, ReferralServiceImpl } from '@user/services';
import { ReferralController, UserController } from '@user/controllers';
import { MongoUserRepository } from '@user/repositories';
import UserModuleTokens from './user.module.tokens';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), ConfigModule, CoreModule],
  controllers: [UserController, ReferralController],
  providers: [
    {
      provide: UserModuleTokens.Services.UserService,
      useClass: UserServiceImpl,
    },
    {
      provide: UserModuleTokens.Services.ReferralService,
      useClass: ReferralServiceImpl,
    },
    {
      provide: UserModuleTokens.Repositories.UserRepository,
      useClass: MongoUserRepository,
    },
  ],
  exports: [UserModuleTokens.Services.UserService],
})
export class UserModule {}
