import * as dayjs from 'dayjs';

export const getCurrentDayInUtc = (): number => {
  return Math.floor(dayjs().utc().toDate().getTime() / 1000 / 60 / 60 / 24);
};

export const getDateFromUtcDay = (utcDay: number) => {
  const dateInMilliseconds = utcDay * 24 * 60 * 60 * 1000;

  return dayjs.utc(dateInMilliseconds).format('MM/DD/YYYY');
};
