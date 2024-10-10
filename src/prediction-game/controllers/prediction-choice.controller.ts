import { Controller, Session, Get, UseGuards, Query, Body, Put, Param, ParseIntPipe } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { ListLatestPredictionChoicesQueryDto, SubmitPredictionChoiceBodyDto } from '@prediction-game/dto';
import { InjectPredictionChoiceService } from '@prediction-game/decorators';
import { PredictionChoiceService } from '@prediction-game/services';

@Controller()
export default class PredictionChoiceController {
  constructor(
    @InjectPredictionChoiceService()
    private readonly predictionChoiceService: PredictionChoiceService,
  ) {}

  @Get('/prediction-choices/my')
  @UseGuards(AuthGuard)
  public async listMyLatestChoices(
    @Session() session: secureSession.Session,
    @Query() query: ListLatestPredictionChoicesQueryDto,
  ) {
    return this.predictionChoiceService.listLatestForUser(session.get('userId'), query.limit);
  }

  @Put('/prediction-choices/:round')
  @UseGuards(AuthGuard)
  public async submitChoice(
    @Session() session: secureSession.Session,
    @Param('round', ParseIntPipe) round: number,
    @Body() body: SubmitPredictionChoiceBodyDto,
  ) {
    return this.predictionChoiceService.submit({
      userId: session.get('userId'),
      predictions: body.predictions,
      round,
    });
  }
}
