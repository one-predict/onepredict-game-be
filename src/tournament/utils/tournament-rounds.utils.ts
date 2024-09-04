import { getCurrentUnixTimestamp } from '@common/utils';

export const getCurrentTournamentRound = (
  tournamentStartTimestamp: number,
  tournamentRoundDurationInSeconds: number,
) => {
  const currentTimestamp = getCurrentUnixTimestamp();

  return Math.floor((currentTimestamp - tournamentStartTimestamp) / tournamentRoundDurationInSeconds);
};

export const getTournamentRoundByTimestamp = (
  timestamp: number,
  tournamentStartTimestamp: number,
  roundDurationInSeconds: number,
) => {
  return Math.floor((timestamp - tournamentStartTimestamp) / roundDurationInSeconds);
};
