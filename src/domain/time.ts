import { Temporal } from '@js-temporal/polyfill'
import type { MeetingConfig } from '../data/meeting'

export type Slot = { startInstant: string; endInstant: string }

export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

export function nextWorkingDate(config: MeetingConfig, now = Temporal.Now.instant()): string {
  let date = now.toZonedDateTimeISO(config.hostTimeZone).toPlainDate().add({ days: 1 })
  while (!config.workingDays.includes(date.dayOfWeek)) date = date.add({ days: 1 })
  return date.toString()
}

export function generateSlots(config: MeetingConfig, dateString: string): Slot[] {
  const date = Temporal.PlainDate.from(dateString)
  if (!config.workingDays.includes(date.dayOfWeek)) return []
  const slots: Slot[] = []
  const start = config.startHour * 60
  const end = config.endHour * 60 - config.durationMinutes
  for (let minuteOfDay = start; minuteOfDay <= end; minuteOfDay += config.slotStepMinutes) {
    const hour = Math.floor(minuteOfDay / 60)
    const minute = minuteOfDay % 60
    const local = date.toPlainDateTime({ hour, minute })
    try {
      // Reject both nonexistent spring times and repeated fall times.
      const zoned = local.toZonedDateTime(config.hostTimeZone, { disambiguation: 'reject' })
      const endInstant = zoned.toInstant().add({ minutes: config.durationMinutes })
      slots.push({ startInstant: zoned.toInstant().toString(), endInstant: endInstant.toString() })
    } catch (error) {
      if (!(error instanceof RangeError)) throw error
    }
  }
  return slots
}

export function formatDateTime(instantString: string, timeZone: string): string {
  const instant = Temporal.Instant.from(instantString)
  const zoned = instant.toZonedDateTimeISO(timeZone)
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(zoned.epochMilliseconds))
  return `${date} · ${timeZone}`
}

export function formatClock(instantString: string, timeZone: string): string {
  const instant = Temporal.Instant.from(instantString)
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(instant.epochMilliseconds))
}

export function formatHostDate(dateString: string, timeZone: string): string {
  const date = Temporal.PlainDate.from(dateString)
  const noon = date.toPlainDateTime({ hour: 12 }).toZonedDateTime(timeZone).toInstant()
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(noon.epochMilliseconds))
}
