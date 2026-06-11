export function isOverdue(dueDate: Date | string | null | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function formatDate(date: Date | string): string {
  return new Date(date).toISOString();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function differenceInDays(dateLeft: Date, dateRight: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((dateLeft.getTime() - dateRight.getTime()) / MS_PER_DAY);
}
