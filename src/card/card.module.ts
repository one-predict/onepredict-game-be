import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { GameCard, GameCardSchema } from '@card/schemas';
import { GameCardServiceImpl } from '@card/services';
import { GameCardController } from '@card/controllers';
import { MongoGameCardRepository } from '@card/repositories';
import CardModuleTokens from './card.module.tokens';

@Module({
  imports: [MongooseModule.forFeature([{ name: GameCard.name, schema: GameCardSchema }]), CoreModule],
  controllers: [GameCardController],
  providers: [
    {
      provide: CardModuleTokens.Services.GameCardService,
      useClass: GameCardServiceImpl,
    },
    {
      provide: CardModuleTokens.Repositories.GameCardRepository,
      useClass: MongoGameCardRepository,
    },
  ],
  exports: [CardModuleTokens.Services.GameCardService],
})
export class CardModule {}
