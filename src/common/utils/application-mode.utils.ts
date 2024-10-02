import 'dotenv/config';
import { ApplicationMode } from '@common/enums';

export const getApplicationMode = (): ApplicationMode => {
  const applicationMode = process.env.APPLICATION_MODE;

  if (applicationMode === ApplicationMode.Cron) {
    return ApplicationMode.Cron;
  }

  return ApplicationMode.Default;
};

export const isCronMode = (): boolean => {
  return getApplicationMode() === ApplicationMode.Cron;
};

export const isDefaultMode = (): boolean => {
  return getApplicationMode() === ApplicationMode.Default;
};
