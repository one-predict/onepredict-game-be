export interface Cursor<Entity> {
  tryNext: () => Promise<Entity>;
  stream<TransformationResult>(
    transform: (entity: Entity) => TransformationResult,
  ): AsyncIterable<TransformationResult>;
}

export abstract class AbstractCursor<Entity> {
  public abstract tryNext(): Promise<Entity>;

  public async *stream<TransformationResult>(
    transform: (entity: Entity) => TransformationResult,
  ): AsyncIterable<TransformationResult> {
    for await (const entity of this) {
      yield transform(entity);
    }
  }

  public [Symbol.asyncIterator](): AsyncIterator<Entity> {
    return {
      next: async (): Promise<IteratorResult<Entity>> => {
        const entity = await this.tryNext();
        return entity ? { value: entity, done: false } : { value: undefined, done: true };
      },
    };
  }
}
