import { addDays, eachDayOfInterval, isBefore, isEqual, parseISO, startOfDay } from 'date-fns';
import type { AvailabilityBlock } from '../../types';

function toDate(date: string) {
  return startOfDay(parseISO(date));
}

export function isBookedNight(day: Date, blocks: AvailabilityBlock[]) {
  const target = startOfDay(day);
  return blocks.some((block) => {
    const from = toDate(block.from);
    const to = toDate(block.to);
    return !isBefore(target, from) && isBefore(target, to);
  });
}

export function isStayAvailable(from: Date, to: Date, blocks: AvailabilityBlock[]) {
  const start = startOfDay(from);
  const end = startOfDay(to);
  if (!isBefore(start, end)) return false;

  const lastNight = addDays(end, -1);
  return !eachDayOfInterval({ start, end: lastNight }).some((day) => isBookedNight(day, blocks));
}

export function isDisplayRangeDay(day: Date, from: Date, to: Date) {
  const target = startOfDay(day);
  return (!isBefore(target, startOfDay(from)) && isBefore(target, startOfDay(to))) || isEqual(target, startOfDay(to));
}
