import Log from "../logger";

const { floor, round, log, abs, clamp } = math;

export const isNaN = (n: number) => n !== n;
export const isEven = (n: number) => n % 2 === 0;

export function fuzzyEquals(a: number, b: number, epsilon = 0.001): boolean {
  return a <= b + epsilon && a >= b - epsilon;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function doubleSidedLimit(n: number, limit: number) {
  return clamp(n, -limit, limit);
}

export function roundDecimal(n: number, decimals = 0): number {
  const mult = 10 ** decimals;
  return round(n * mult + 0.5) / mult;
}

/**
 * Returns 0 if the number is close enough to 0 by `epsilon`
 * @param n
 * @param epsilon
 */
export function flattenNumber(n: number, epsilon = 0.001): number {
  return abs(n) < epsilon ? 0 : n;
}

export function toNearestFiveOrTen(n: number): number {
  let result = floor(n / 5 + 0.5) * 5;
  if (result % 10 !== 0)
    result += 10 - result % 10;

  return result;
}

export function commaFormat(n: number | string): string {
  let formatted = tostring(n);
  const parts: string[] = [];

  while (formatted.size() > 3) {
    parts.insert(0, formatted.sub(-3));
    formatted = formatted.sub(1, -4);
  }

  parts.insert(0, formatted);
  return parts.join(",");
}

const suffixes = <const>["K", "M", "B", "T", "Q"];
export function toSuffixedNumber(n: number): string {
  if (n < 100_000)
    return commaFormat(n);

  const index = floor(log(n, 1000)) - 1;
  const divisor = 10 ** ((index + 1) * 3);
  const [baseNumber] = "%.1f".format(floor(n / divisor)).gsub("%.?0+$", "");
  return baseNumber + (index < 0 ? "" : suffixes[index]);
}

export function parseSuffixedNumber(suffixed: string): number {
  const match = suffixed.gsub(",", "")[0].match("^([0-9,.]+)([KMBT]?)$");
  if (!match)
    throw new Log.Exception("InvalidSuffixedNumber", "Invalid suffixed number format");

  let numberPart = tostring(match[0]);
  const suffix = tostring(match[1]);

  if (suffix && suffix !== "" && suffix !== "nil") {
    const index = (<readonly string[]>suffixes).indexOf(suffix.lower());
    if (index === -1)
      throw new Log.Exception("InvalidNumberSuffix", "Invalid suffix in suffixed number");

    const multiplier = 10 ** ((index + 1) * 3);
    numberPart = tostring(tonumber(numberPart)! * multiplier);
  }

  return tonumber(numberPart)!;
}