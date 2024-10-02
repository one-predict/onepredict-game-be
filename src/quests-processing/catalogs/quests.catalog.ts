export interface QuestsCatalog {
  build(map: Record<string, string[]>): Promise<void>;
  getQuestIdsByTag(tag: string): Promise<string[]>;
  getQuestIdsByTags(tags: string[]): Promise<string[]>;
}

export class InMemoryQuestsCatalog implements QuestsCatalog {
  private index: Map<string, string[]> = new Map();

  constructor() {}

  public async build(map: Record<string, string[]>) {
    this.index = new Map(Object.entries(map));
  }

  public async getQuestIdsByTag(tag: string) {
    return this.index.get(tag) || [];
  }

  public async getQuestIdsByTags(tags: string[]) {
    const questIdsSet = new Set<string>();

    for (const tag of tags) {
      const questIds = await this.getQuestIdsByTag(tag);

      for (const questId of questIds) {
        questIdsSet.add(questId);
      }
    }

    return Array.from(questIdsSet);
  }
}
