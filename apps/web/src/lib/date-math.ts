const MS_PER_DAY = 86400000;

function addMonthsClamped(year: number, month: number, day: number, months: number): Date {
  const targetYear = year + Math.floor((month + months) / 12);
  const targetMonth = ((month + months) % 12 + 12) % 12;
  const maxDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, maxDay)));
}

export interface DiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  valid: boolean;
}

export function computeDiff(fromStr: string, toStr: string): DiffResult {
  if (!fromStr || !toStr) return { years: 0, months: 0, days: 0, totalDays: 0, totalWeeks: 0, valid: false };
  const from = new Date(fromStr + "T00:00:00Z");
  const to = new Date(toStr + "T00:00:00Z");
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
    return { years: 0, months: 0, days: 0, totalDays: 0, totalWeeks: 0, valid: false };
  }
  const totalDays = Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
  const totalWeeks = Math.floor(totalDays / 7);
  let monthsDiff = (to.getUTCFullYear() * 12 + to.getUTCMonth()) - (from.getUTCFullYear() * 12 + from.getUTCMonth());
  let anchor = addMonthsClamped(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), monthsDiff);
  if (anchor > to) {
    monthsDiff--;
    anchor = addMonthsClamped(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), monthsDiff);
  }
  const years = Math.floor(monthsDiff / 12);
  const months = monthsDiff % 12;
  const days = Math.round((to.getTime() - anchor.getTime()) / MS_PER_DAY);
  return { years, months, days, totalDays, totalWeeks, valid: true };
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  nextBirthdayDays: number;
  valid: boolean;
}

export function computeAge(birthStr: string, refStr: string): AgeResult {
  const birth = new Date(birthStr + "T00:00:00Z");
  const ref = new Date(refStr + "T00:00:00Z");
  const invalid = !birthStr || !refStr || isNaN(birth.getTime()) || isNaN(ref.getTime()) || birth > ref;
  if (invalid) return { years: 0, months: 0, days: 0, totalDays: 0, totalWeeks: 0, nextBirthdayDays: 0, valid: false };

  const totalDays = Math.round((ref.getTime() - birth.getTime()) / MS_PER_DAY);
  const totalWeeks = Math.floor(totalDays / 7);

  const { years, months, days } = computeDiff(birthStr, refStr);

  let nextBirthday = new Date(Date.UTC(ref.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()));
  if (nextBirthday <= ref) nextBirthday = new Date(Date.UTC(ref.getUTCFullYear() + 1, birth.getUTCMonth(), birth.getUTCDate()));
  const nextBirthdayDays = Math.round((nextBirthday.getTime() - ref.getTime()) / MS_PER_DAY);

  return { years, months, days, totalDays, totalWeeks, nextBirthdayDays, valid: true };
}
