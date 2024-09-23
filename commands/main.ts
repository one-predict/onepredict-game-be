import { CommandFactory } from 'nest-commander';
import { Module } from '@nestjs/common';
import { CreateTournamentCommand } from './create-tournament.command';

@Module({
  providers: [CreateTournamentCommand],
})
export class AppModule {}

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
