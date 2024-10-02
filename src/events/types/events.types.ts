import { AnyObject } from '@common/types';

export interface Event<Type extends string, Data extends AnyObject> {
  id: string;
  type: Type;
  category: string;
  data: Data;
  userId: string | null;
  createdAt: Date;
  meta?: AnyObject;
}
