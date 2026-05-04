import {
  differenceInDays,
  differenceInYears,
  differenceInMonths,
  addYears,
  isAfter,
  setYear,
} from 'date-fns';

export function totalDays(date: Date): number {
  return differenceInDays(new Date(), date);
}

export interface LiveAge {
  years: number;
  months: number;
  days: number;
  label: string;
}

export function liveAge(date: Date): LiveAge {
  const now = new Date();
  const years = differenceInYears(now, date);
  const months = differenceInMonths(now, date) % 12;
  const afterYearsMonths = new Date(date.getFullYear() + years, date.getMonth() + months, date.getDate());
  const days = differenceInDays(now, afterYearsMonths);
  return { years, months, days, label: `${years}y ${months}m ${days}d` };
}

export function daysUntilNextBirthday(date: Date): number {
  const now = new Date();
  let next = setYear(date, now.getFullYear());
  if (!isAfter(next, now)) next = addYears(next, 1);
  return differenceInDays(next, now);
}

export function progressToNextBirthday(date: Date): number {
  const daysLeft = daysUntilNextBirthday(date);
  return Math.max(0, Math.min(1, 1 - daysLeft / 365));
}

export function anniversaryProgress(date: Date): number {
  const now = new Date();
  const years = differenceInYears(now, date);
  const lastAnniv = addYears(date, years);
  const nextAnniv = addYears(date, years + 1);
  const total = differenceInDays(nextAnniv, lastAnniv);
  const elapsed = differenceInDays(now, lastAnniv);
  return Math.max(0, Math.min(1, elapsed / total));
}
