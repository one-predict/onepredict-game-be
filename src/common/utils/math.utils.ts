export const calculatePercentageChange = (
  initialValue: number,
  finalValue: number,
  fractionDigits: number = 2,
) => {
  const percentageChange = ((finalValue - initialValue) / initialValue) * 100;

  return Number(percentageChange.toFixed(fractionDigits));
};
