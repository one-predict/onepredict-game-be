import { Cursor } from '@common/data';

const DEFAULT_BATCH_LIMIT = 500;

export const processCursor = async <Entity>(
  cursor: Cursor<Entity>,
  callback: (batch: Array<Entity>) => Promise<void>,
  batchLimit = DEFAULT_BATCH_LIMIT,
) => {
  let batch: Array<Entity> = [];
  let entity: Entity | null;

  do {
    entity = await cursor.tryNext();

    if (entity) {
      batch.push(entity);
    }

    if (batch.length === batchLimit) {
      await callback(batch);

      batch = [];
    }
  } while (entity);

  if (batch.length) {
    await callback(batch);
  }
};
