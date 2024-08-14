import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@core';
import { UserModule } from '@user';
import { TournamentParticipationServiceImpl, TournamentServiceImpl } from '@tournament/services';
import { MongodbTournamentParticipationRepository, MongoTournamentRepository } from '@tournament/repositories';
import {
  Tournament,
  TournamentParticipation,
  TournamentParticipationSchema,
  TournamentSchema,
} from '@tournament/schemas';
import { TournamentParticipationController, TournamentController } from '@tournament/controllers';
import TournamentModuleTokens from './tournament.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tournament.name, schema: TournamentSchema }]),
    MongooseModule.forFeature([{ name: TournamentParticipation.name, schema: TournamentParticipationSchema }]),
    ConfigModule,
    UserModule,
    CoreModule,
  ],
  controllers: [TournamentController, TournamentParticipationController],
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
  ],
  exports: [
    TournamentModuleTokens.Services.TournamentService,
    TournamentModuleTokens.Services.TournamentParticipationService,
  ],
})
export class TournamentModule {}
