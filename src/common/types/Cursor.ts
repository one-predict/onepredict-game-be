export interface AbstractCursor<Entity> {
  tryNext: () => Promise<Entity>;
}
