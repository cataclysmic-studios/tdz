const { max, min, floor, random } = math;

export function shuffle<T>(array: T[]): T[] {
  // Fisher-Yates shuffle algorithm
  const shuffledArray = [...array];
  for (let i = shuffledArray.size() - 1; i > 0; i--) {
    const j = floor(random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export function removeDuplicates<T extends defined>(array: T[]): T[] {
  const seen = new Set<T>();
  return array.filter((value) => {
    if (!seen.has(value)) {
      seen.add(value);
      return true;
    }
    return false;
  });
}

export function flatten<T extends defined>(array: (T | T[])[], recursive = true): T[] {
  const result: T[] = [];
  for (const value of array) {
    if (typeOf(value) === "table" && recursive) {
      if ((<T[]>value).size() === 0 || (<T[]>value)[0] === undefined) {
        result.push(<T>value);
        continue;
      }
      const flattenedSubtable = flatten(<T[]>value, recursive);
      for (const subValue of flattenedSubtable)
        result.push(subValue);
    } else
      result.push(<T>value);
  }
  return result;
}

export function reverse<T extends defined>(arr: T[]): T[] {
  return arr.map((_, i) => arr[arr.size() - 1 - i]);
}

export function slice<T extends defined>(arr: T[], start: number, finish?: number): T[] {
  const length = arr.size();

  // Handling negative indices
  const startIndex = start < 0 ? max(length + start, 0) : min(start, length);
  const endIndex = finish === undefined ? length : finish < 0 ? max(length + finish, 0) : min(finish, length);

  // Creating a new array with sliced elements
  const slicedArray: T[] = [];
  for (let i = startIndex; i < endIndex; i++)
    slicedArray.push(arr[i]);

  return slicedArray;
}