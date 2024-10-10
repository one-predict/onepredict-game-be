export interface PredictionStreakDto {
  id: string;
  userId: string;
  assetStreaks: Record<string, number>;
  choicesStreak: number;
  currentSequence: number;
  createdAt: Date;
  updatedAt: Date;
}
