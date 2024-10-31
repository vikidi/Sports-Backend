export {}; // This is to combat the TS2451 error

export const roundTo = (n: number, digits: number) => {
  let negative = false;

  if (Number.isNaN(digits)) {
    return n.toString();
  }

  if (n < 0) {
    negative = true;
    n = n * -1;
  }
  let multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  n = Math.round(n) / multiplicator;
  if (negative) {
    n = n * -1;
  }
  return n.toFixed(digits);
};

export function removeItemOnce<T>(arr: Array<T>, value: T): Array<T> {
  let index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function removeItemAll<T>(arr: Array<T>, value: T): Array<T> {
  let i = 0;
  while (i < arr.length) {
    if (String(arr[i]) === String(value)) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}
