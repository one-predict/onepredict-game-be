import { Cursor as MongooseCursor, QueryOptions } from 'mongoose';
import { AbstractCursor, Cursor } from '@common/data';

export default class MongodbCursorAdapter<Document, Entity> extends AbstractCursor<Entity> implements Cursor<Entity> {
  constructor(
    private cursor: MongooseCursor<Document, QueryOptions<Document>>,
    private mapper: (document: Document) => Entity,
  ) {
    super();
  }

  public async tryNext() {
    const document = await this.cursor.next();

    return document && this.mapper(document);
  }
}
