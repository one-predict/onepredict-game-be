import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@user/schemas';
import { UserServiceImpl } from '@user/services';
import { UserController } from '@user/controllers';
import { MongoUserRepository } from '@user/repositories';

import UserModuleTokens from './user.module.tokens';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [
    {
      provide: UserModuleTokens.Services.UserService,
      useClass: UserServiceImpl,
    },
    {
      provide: UserModuleTokens.Repositories.UserRepository,
      useClass: MongoUserRepository,
    },
  ],
  exports: [UserModuleTokens.Services.UserService],
})
export class UserModule {}
