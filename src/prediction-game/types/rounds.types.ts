export interface RoundBoundaries {
  startTimestamp: number;
  endTimestamp: number;
}

export interface RoundsInfo {
  currentRound: number;
  currentRoundTimeBoundaries: RoundBoundaries;
  nextRound: number;
  nextRoundTimeBoundaries: RoundBoundaries;
  nextRoundAssets: string[];
}
