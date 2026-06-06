import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function formatDate(date: string): string {
  return format(new Date(date), 'd MMM yyyy', { locale: enUS });
}

export function formatDateShort(date: string): string {
  return format(new Date(date), 'd MMM', { locale: enUS });
}

export function formatRelativeDate(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: enUS });
}

export function isOverdue(date: string): boolean {
  return isBefore(new Date(date), new Date());
}

export function isDueSoon(date: string, daysThreshold = 3): boolean {
  const dueDate = new Date(date);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  return isAfter(dueDate, new Date()) && isBefore(dueDate, threshold);
}

export function formatChecklistProgress(checked: number, total: number): string {
  if (total === 0) return '';
  return `${checked}/${total}`;
}

export function getChecklistPercentage(checked: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((checked / total) * 100);
}