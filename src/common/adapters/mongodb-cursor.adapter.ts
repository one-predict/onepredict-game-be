import { Cursor, QueryOptions } from 'mongoose';
import { AbstractCursor } from '@common/types';

export default class MongodbCursorAdapter<Document, Entity> implements AbstractCursor<Entity> {
  constructor(
    private cursor: Cursor<Document, QueryOptions<Document>>,
    private mapper: (document: Document) => Entity,
  ) {}

  public async tryNext() {
    const document = await this.cursor.next();

    return document && this.mapper(document);
  }
}
