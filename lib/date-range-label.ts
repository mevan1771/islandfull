import { addDays, differenceInDays, format, isSameDay, parseISO } from "date-fns"

/** Hotel nights are exclusive of checkout. First click must not leave check-in === checkout. */
export function withDefaultCheckout<T extends { from?: Date; to?: Date }>(
  next: T | undefined
): T | undefined {
  if (!next?.from) return undefined
  if (!next.to || isSameDay(next.from, next.to)) {
    return { ...next, from: next.from, to: addDays(next.from, 1) }
  }
  return next
}

export function inclusiveDays(from: Date, to: Date) {
  return Math.max(1, differenceInDays(to, from) + 1)
}

export function dayCountLabel(days: number) {
  return days === 1 ? "1 day" : `${days} days`
}

export function formatDateRangeWithDays(from: Date, to: Date, dateFmt: string) {
  return `${format(from, dateFmt)} - ${format(to, dateFmt)} · ${dayCountLabel(inclusiveDays(from, to))}`
}

export function formatIsoRangeWithDays(start: string, end?: string | null) {
  if (!end || end === start) return start
  const from = parseISO(start)
  const to = parseISO(end)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return `${start} to ${end}`
  }
  return `${start} to ${end} (${dayCountLabel(inclusiveDays(from, to))})`
}

export function travelRangeFromOffer(travelDate: string, specialNotes?: string | null) {
  const match = specialNotes?.match(/Dates:\s*(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
  return formatIsoRangeWithDays(travelDate, match?.[2] || null)
}
