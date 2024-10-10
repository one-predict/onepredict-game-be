import { Controller, Session, Get, UseGuards } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { InjectPredictionStreakService } from '@prediction-game/decorators';
import { PredictionStreakService } from '@prediction-game/services';

@Controller()
export default class PredictionStreakController {
  constructor(
    @InjectPredictionStreakService()
    private readonly predictionStreakService: PredictionStreakService,
  ) {}

  @Get('/prediction-streaks/my')
  @UseGuards(AuthGuard)
  public async getMyStreak(@Session() session: secureSession.Session) {
    const streak = await this.predictionStreakService.getForUser(session.get('userId'));

    return { streak };
  }
}
