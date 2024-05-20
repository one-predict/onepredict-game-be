import * as dayjs from 'dayjs';

export const convertMsToDay = (ms: number): number => {
  return Math.floor(ms / 1000 / 60 / 60 / 24);
};

export const getCurrentDayInUtc = (): number => {
  return convertMsToDay(dayjs().utc().toDate().getTime());
};

export const getDateFromUtcDay = (utcDay: number) => {
  const dateInMilliseconds = utcDay * 24 * 60 * 60 * 1000;

  return dayjs.utc(dateInMilliseconds).format('MM/DD/YYYY');
};
