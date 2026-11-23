import { afterEach, describe, expect, it, vi } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { meeting, type MeetingConfig } from '../src/data/meeting'
import { isReserved, validateAttendee, type Booking } from '../src/domain/booking'
import { formatDateTime, generateSlots } from '../src/domain/time'
import { loadBookings, saveBooking } from '../src/storage/bookings'

describe('time-zone-safe availability', () => {
  it('keeps the same instant in host and invitee zones, including a date change', () => {
    const slot = generateSlots(meeting, '2027-03-26').find(item =>
      Temporal.Instant.from(item.startInstant).toZonedDateTimeISO('Europe/London').hour === 15,
    )!
    expect(slot).toBeDefined()
    expect(Temporal.Instant.from(slot.startInstant).toZonedDateTimeISO('Europe/London').day).toBe(26)
    expect(Temporal.Instant.from(slot.startInstant).toZonedDateTimeISO('Pacific/Auckland').day).toBe(27)
    expect(formatDateTime(slot.startInstant, 'Pacific/Auckland')).toContain('Pacific/Auckland')
    expect(Temporal.Instant.from(slot.startInstant).toString()).toBe(slot.startInstant)
  })

  it('uses the offset on the meeting date across the London spring transition', () => {
    const atTen = (date: string) => generateSlots(meeting, date).find(item =>
      Temporal.Instant.from(item.startInstant).toZonedDateTimeISO('Europe/London').hour === 10,
    )!
    expect(atTen('2027-03-26').startInstant).toContain('10:00:00Z')
    expect(atTen('2027-03-29').startInstant).toContain('09:00:00Z')
  })

  it('rejects nonexistent spring times and repeated fall times', () => {
    const overnight: MeetingConfig = {
      ...meeting,
      hostTimeZone: 'America/New_York',
      workingDays: [7],
      startHour: 1,
      endHour: 4,
    }
    const springHours = generateSlots(overnight, '2026-03-08').map(slot =>
      Temporal.Instant.from(slot.startInstant).toZonedDateTimeISO(overnight.hostTimeZone).hour,
    )
    expect(springHours).not.toContain(2)
    const fallHours = generateSlots(overnight, '2026-11-01').map(slot =>
      Temporal.Instant.from(slot.startInstant).toZonedDateTimeISO(overnight.hostTimeZone).hour,
    )
    expect(fallHours).not.toContain(1)
  })
})

describe('booking state', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('validates attendee details', () => {
    expect(validateAttendee('', 'a@example.com')).toBeTruthy()
    expect(validateAttendee('Alex', 'bad')).toBeTruthy()
    expect(validateAttendee('Alex', 'a@example.com')).toBeNull()
  })

  it('persists a booked instant and marks it unavailable after reload', () => {
    const memory = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => memory.get(key) || null,
      setItem: (key: string, value: string) => memory.set(key, value),
    })
    const booking: Booking = {
      id: 'one', meetingId: meeting.id, startInstant: '2027-03-29T09:00:00Z',
      durationMinutes: 30, hostTimeZone: 'Europe/London', inviteeTimeZone: 'Asia/Kolkata',
      attendeeName: 'Alex', attendeeEmail: 'alex@example.com',
    }
    saveBooking(booking)
    const reloaded = loadBookings()
    expect(reloaded).toEqual([booking])
    expect(isReserved(reloaded, meeting.id, booking.startInstant)).toBe(true)
  })
})
