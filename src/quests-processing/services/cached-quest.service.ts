import { Injectable } from '@nestjs/common';
import { CacheManager } from '@cache/managers';
import { InjectCacheManager } from '@cache/decorators';
import { QuestService } from '@quests/services';
import { InjectQuestService } from '@quests/decorators';
import { QuestDto } from '@quests/dto';
import { QuestsProcessingCacheNamespace } from '@quests-processing/enums';

@Injectable()
export class CachedQuestService implements QuestService {
  constructor(
    @InjectQuestService() private originalQuestService: QuestService,
    @InjectCacheManager(QuestsProcessingCacheNamespace.Quests) private questsCacheManager: CacheManager,
  ) {}

  public streamAllActive() {
    return this.originalQuestService.streamAllActive();
  }

  public listAvailableUserQuests(userId: string, group?: string) {
    return this.originalQuestService.listAvailableUserQuests(userId, group);
  }

  public listActiveQuestIdsByTags(objectiveTags: string[]) {
    return this.originalQuestService.listActiveQuestIdsByTags(objectiveTags);
  }

  public async getById(id: string) {
    const cachedQuest = await this.questsCacheManager.get<QuestDto>(id);

    if (cachedQuest) {
      return cachedQuest;
    }

    const quest = await this.originalQuestService.getById(id);

    await this.questsCacheManager.set(id, quest);

    return quest;
  }

  public startQuest(questId: string, userId: string) {
    return this.originalQuestService.startQuest(questId, userId);
  }
}
