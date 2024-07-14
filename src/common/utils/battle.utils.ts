import { PortfolioEntity } from '@app/portfolio';

export interface BattlePortfolioReward {
    userId: string;
    rewards: number;
    earnedCoins: number;
}

export function getBattlePortfoliosRewards(portfolios: PortfolioEntity[], prizePool: number): BattlePortfolioReward[] {
  const sortedPortfolios = portfolios.sort((a, b) => b.getEarnedCoins() - a.getEarnedCoins());

  const winnerEarnedCoins = sortedPortfolios[0].getEarnedCoins();
  const winnerPortfolios = sortedPortfolios
      .filter((portfolio) => portfolio.getEarnedCoins() === winnerEarnedCoins);

  const rewardPoints = prizePool / winnerPortfolios.length;

  return winnerPortfolios.map((portfolio) => ({
    userId: portfolio.getUserId(),
    earnedCoins: portfolio.getEarnedCoins(),
    rewards: rewardPoints,
  }));
}
