import { Controller, Session, Get, UseGuards, Post, Param, Put } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { InjectQuestService, InjectQuestRewardsService, InjectQuestVerificationService } from '@quests/decorators';
import { QuestService, QuestsRewardsService, QuestVerificationService } from '@quests/services';

@Controller()
export default class PortfolioController {
  constructor(
    @InjectQuestService() private readonly questService: QuestService,
    @InjectQuestRewardsService() private readonly questRewardService: QuestsRewardsService,
    @InjectQuestVerificationService() private readonly questVerificationService: QuestVerificationService,
  ) {}

  @Get('/quests')
  @UseGuards(AuthGuard)
  public listMyQuests(@Session() session: secureSession.Session) {
    return this.questService.listAvailableUserQuests(session.get('userId'));
  }

  @Post('/quests/:id/claim')
  @UseGuards(AuthGuard)
  public claimQuestReward(@Session() session: secureSession.Session, @Param('id') questId: string) {
    return this.questRewardService.claimReward(questId, session.get('userId'));
  }

  @Put('/quests/:id/start')
  @UseGuards(AuthGuard)
  public async startQuest(@Session() session: secureSession.Session, @Param('id') questId: string) {
    const questProgress = await this.questService.startQuest(questId, session.get('userId'));

    return { progressState: questProgress };
  }

  @Put('/quests/:id/verification')
  @UseGuards(AuthGuard)
  public async verifyQuest(@Session() session: secureSession.Session, @Param('id') questId: string) {
    const questProgress = await this.questVerificationService.verify(questId, session.get('userId'));

    return { progressState: questProgress };
  }
}
