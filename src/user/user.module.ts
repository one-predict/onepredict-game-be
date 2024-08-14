import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { InventoryModule } from '@inventory';
import { User, UserSchema } from '@user/schemas';
import { UserServiceImpl } from '@user/services';
import { UserController } from '@user/controllers';
import { MongoUserRepository } from '@user/repositories';
import UserModuleTokens from './user.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
    CoreModule,
    InventoryModule,
  ],
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
