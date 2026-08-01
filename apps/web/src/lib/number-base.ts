const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

export function parseInBase(input: string, base: number): bigint {
  let s = input.trim().toLowerCase();
  if (base === 16 && s.startsWith("0x")) s = s.slice(2);
  if (base === 2 && s.startsWith("0b")) s = s.slice(2);
  if (base === 8 && s.startsWith("0o")) s = s.slice(2);
  if (!s) throw new Error("empty");
  let big = 0n;
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) throw new Error("invalid");
    big = big * BigInt(base) + BigInt(d);
  }
  return big;
}

export function convertBase(input: string, from: number, to: number): string {
  return parseInBase(input, from).toString(to).toUpperCase();
}
