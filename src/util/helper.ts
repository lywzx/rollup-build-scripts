/**
 * transform value to array
 * @param data
 */
export function castArray<T>(data: ReadonlyArray<T> | T): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return [data] as T[];
}
