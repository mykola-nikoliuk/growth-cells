export function clamp(value: number, lower: number, upper = Infinity) {
  return Math.min(Math.max(value, lower), upper);
}
