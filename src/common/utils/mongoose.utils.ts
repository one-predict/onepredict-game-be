import { SortDirection } from '@common/enums';

export const transformSortArrayToSortObject = (
  sortArray: Array<{ field: string; direction: SortDirection }>,
  fieldMapper: (field: string) => string = (field) => field,
) => {
  return sortArray.reduce(
    (previousSort, { field, direction }) => {
      previousSort[fieldMapper(field)] = direction === SortDirection.Ascending ? 1 : -1;

      return previousSort;
    },
    {} as Record<string, 1 | -1>,
  );
};

export default transformSortArrayToSortObject;
