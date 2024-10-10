import { Controller, Session, Get, UseGuards } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { InjectPredictionGameRoundService } from '@prediction-game/decorators';
import { PredictionGameRoundService } from '@prediction-game/services';

@Controller()
export default class PredictionGameRoundController {
  constructor(
    @InjectPredictionGameRoundService()
    private readonly predictionGameRoundService: PredictionGameRoundService,
  ) {}

  @Get('/prediction-game-rounds/info')
  @UseGuards(AuthGuard)
  public async getRoundsInfo(@Session() session: secureSession.Session) {
    return this.predictionGameRoundService.getRoundsInfoForUser(session.get('userId'));
  }
}
