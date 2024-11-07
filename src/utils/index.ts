export {}; // This is to combat the TS2451 error

/**
 * Rounds a number to the given number of decimal places.
 *
 * @param {number} value - The value to round.
 * @param {number} decimalPlaces - The number of decimal places to round to.
 * @returns {string} The rounded value as a string.
 */
export const roundTo = (value: number, decimalPlaces: number): string => {
  if (isNaN(decimalPlaces)) {
    return value.toString();
  }

  const multiplier = 10 ** decimalPlaces;
  const roundedValue = Math.round(value * multiplier) / multiplier;
  return roundedValue.toFixed(decimalPlaces);
};

/**
 * Removes the first occurrence of a given element from an array
 * @template T
 * @param {Array<T>} array The array from which to remove the element
 * @param {T} element The element to remove
 * @returns {Array<T>} The array with the first occurrence of the element removed
 */
export function removeItemOnce<T>(array: Array<T>, element: T): Array<T> {
  const index = array.indexOf(element);

  if (index > -1) {
    array.splice(index, 1);
  }

  return array;
}

/**
 * Removes all occurrences of a given element from an array
 * @template T
 * @param {Array<T>} array The array from which to remove the element
 * @param {T} value The element to remove
 * @returns {Array<T>} The array with the element removed
 */
export function removeAllOccurrences<T>(array: Array<T>, value: T): Array<T> {
  return array.filter((element) => !Object.is(element, value));
}
