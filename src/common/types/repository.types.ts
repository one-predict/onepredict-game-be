import { SortDirection } from '@common/enums';

export interface FindEntitiesQuery<EntitiesFilter, SortField extends string = string> {
  filter: EntitiesFilter;
  sort?: Array<{ field: SortField; direction: SortDirection }>;
  limit?: number;
  skip?: number;
}
