// Utility to convert camelCase to snake_case
export const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = obj[key];
      return acc;
    },
    {} as Record<string, any>,
  );
};

// Utility to convert snake_case to camelCase
export const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = obj[key];
      return acc;
    },
    {} as Record<string, any>,
  );
};
