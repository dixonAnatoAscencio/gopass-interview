export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}

export interface IPaginatedRepository<T, Filter = Record<string, unknown>> {
  findMany(filter: Filter, page: number, limit: number): Promise<{ data: T[]; total: number }>;
}
