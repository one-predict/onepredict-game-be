import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@core';
import { UserModule } from '@user';
import { InventoryModule } from '@inventory';
import { EventsModule } from '@events';
import { DeduplicationModule } from '@deduplication';
import {
  DefaultTournamentQuestActionsDetectionService,
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
import { TournamentQuestActionsDetectionConsumer } from './consumers';
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
    EventsModule,
    DeduplicationModule,
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
    {
      provide: TournamentModuleTokens.Services.TournamentQuestActionsDetectionService,
      useClass: DefaultTournamentQuestActionsDetectionService,
    },
    {
      provide: TournamentQuestActionsDetectionConsumer,
      useClass: TournamentQuestActionsDetectionConsumer,
    },
  ],
  exports: [
    TournamentModuleTokens.Services.TournamentService,
    TournamentModuleTokens.Services.TournamentParticipationService,
    TournamentModuleTokens.Services.TournamentDeckService,
  ],
})
export class TournamentModule {
  public static Tokens = TournamentModuleTokens;
}
