/**
 * the golden ratio constant.
 * {@link} https://en.wikipedia.org/wiki/Golden_ratio
 */
export const GOLDEN_RATIO = 1.618;

/**
 * rounds a number to the nearest multiple of another number
 *
 * @param n the number to round
 * @param nearest the number to round to
 * @returns the rounded number
 * @example const roundToNearest5 = roundToNearestN(5);
 * roundToNearest5(13) // 15
 * roundToNearest5(12) // 10
 */
export const roundToNearestN = (nearest: number) => (n: number) => {
  return Math.round(n / nearest) * nearest;
};

/**
 * get the prime factors of a number
 *
 * @param num the number to get the prime factors of
 * @returns the prime factors of the number
 * @example getPrimeFactors(12) // [2, 2, 3]
 * getPrimeFactors(15) // [3, 5]
 */
export const getPrimeFactors = (num: number) => {
  const factors = [];
  let divisor = 2;

  while (num >= 2) {
    if (num % divisor === 0) {
      factors.push(divisor);
      num = num / divisor;
    } else {
      divisor++;
    }
  }

  return factors;
};

/**
 * get the lowest prime factor of a number
 *
 * @param num the number to get the lowest prime factor of
 * @returns the lowest prime factor of the number
 * @example
 * lowestPrimeFactor(12) // 12 = 2 * 2 * 3, min(2, 2, 3) = 2
 * lowestPrimeFactor(15) // 15 = 3 * 5, min(3, 5) = 3
 */
export const lowestPrimeFactor = (num: number) => {
  if (num === 1) return 1; // 1 has no prime factors
  return Math.min(...getPrimeFactors(num));
};

/**
 * get the greatest common divisor of two numbers.
 * {@link} https://en.wikipedia.org/wiki/Euclidean_algorithm
 * {@link} https://en.wikipedia.org/wiki/Greatest_common_divisor
 *
 * @param a the first number
 * @param b the second number
 * @returns the greatest common divisor of the two numbers
 * @example gcd(12, 15) // 3
 * gcd(12, 18) // 6
 */
export const gcd = (a: number, b: number): number => {
  if (b === 0) return a;
  return gcd(b, a % b);
};

/**
 * check if two numbers are within a certain tolerance of each other
 */
export const within = (tolerance: number) => (a: number, b: number) => {
  return Math.abs(a - b) <= tolerance;
};

/**
 * get the average of an array of numbers
 *
 * @param arr the array of numbers to average
 * @returns the average of the array
 * @example average([1, 2, 3]) // 2
 * average([1, 2, 3, 4]) // 2.5
 */
export const average = (arr: number[]) => {
  if (arr.length === 0) return 0;
  return arr.reduce((acc, val) => acc + val, 0) / arr.length;
};
