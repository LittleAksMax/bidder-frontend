// Binary search algorithm for strings
export const binarySearchStrings = (sortedArray: string[], target: string): number => {
  let left = 0;
  let right = sortedArray.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = sortedArray[mid];

    if (midValue === target) {
      return mid; // Target found
    } else if (midValue! < target) {
      left = mid + 1; // Search in the right half
    } else {
      right = mid - 1; // Search in the left half
    }
  }

  return -1; // Target not found
};

export const binSearchContains = (collection: string[], item: string): boolean => {
  return binarySearchStrings(collection, item) !== -1;
};
