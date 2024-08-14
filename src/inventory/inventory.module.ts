import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { CardModule } from '@card';
import { UserInventory, UserInventorySchema } from '@inventory/schemas';
import { UserInventoryServiceImpl } from '@inventory/services';
import { MongoUserInventoryRepository } from '@inventory/repositories';
import { UserInventoryController } from '@inventory/controllers';
import InventoryModuleTokens from './inventory.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserInventory.name, schema: UserInventorySchema }]),
    CoreModule,
    CardModule,
  ],
  controllers: [UserInventoryController],
  providers: [
    {
      provide: InventoryModuleTokens.Services.UserInventoryService,
      useClass: UserInventoryServiceImpl,
    },
    {
      provide: InventoryModuleTokens.Repositories.UserInventoryRepository,
      useClass: MongoUserInventoryRepository,
    },
  ],
  exports: [InventoryModuleTokens.Services.UserInventoryService],
})
export class InventoryModule {}
