import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@core';
import { UserModule } from '@user';
import { InventoryModule } from '@inventory';
import {
  TournamentDeckServiceImpl,
  TournamentParticipationServiceImpl,
  TournamentServiceImpl,
} from '@tournament/services';
import {
  MongodbTournamentParticipationRepository,
  MongoTournamentRepository,
  MongoTournamentDeckRepository,
} from '@tournament/repositories';
import {
  Tournament,
  TournamentDeck,
  TournamentParticipation,
  TournamentDeckSchema,
  TournamentParticipationSchema,
  TournamentSchema,
} from '@tournament/schemas';
import {
  TournamentParticipationController,
  TournamentController,
  TournamentDeckController,
} from '@tournament/controllers';
import TournamentModuleTokens from './tournament.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tournament.name, schema: TournamentSchema }]),
    MongooseModule.forFeature([{ name: TournamentParticipation.name, schema: TournamentParticipationSchema }]),
    MongooseModule.forFeature([{ name: TournamentDeck.name, schema: TournamentDeckSchema }]),
    ConfigModule,
    UserModule,
    CoreModule,
    InventoryModule,
  ],
  controllers: [TournamentController, TournamentParticipationController, TournamentDeckController],
  providers: [
    {
      provide: TournamentModuleTokens.Services.TournamentService,
      useClass: TournamentServiceImpl,
    },
    {
      provide: TournamentModuleTokens.Repositories.TournamentRepository,
      useClass: MongoTournamentRepository,
    },
    {
      provide: TournamentModuleTokens.Services.TournamentParticipationService,
      useClass: TournamentParticipationServiceImpl,
    },
    {
      provide: TournamentModuleTokens.Repositories.TournamentParticipationRepository,
      useClass: MongodbTournamentParticipationRepository,
    },
    {
      provide: TournamentModuleTokens.Services.TournamentDeckService,
      useClass: TournamentDeckServiceImpl,
    },
    {
      provide: TournamentModuleTokens.Repositories.TournamentDeckRepository,
      useClass: MongoTournamentDeckRepository,
    },
  ],
  exports: [
    TournamentModuleTokens.Services.TournamentService,
    TournamentModuleTokens.Services.TournamentParticipationService,
    TournamentModuleTokens.Services.TournamentDeckService,
  ],
})
export class TournamentModule {}
