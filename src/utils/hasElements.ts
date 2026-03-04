export const hasElements = <T = any>(data?: T[]): data is T[] =>
  Array.isArray(data) && data.length > 0;
