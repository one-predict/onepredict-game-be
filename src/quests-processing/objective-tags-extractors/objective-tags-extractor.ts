export interface ObjectiveTagsExtractor<QuestAction> {
  extract(action: QuestAction): string[];
}
