import type { Booking } from '../domain/booking'

const KEY = 'kestrel-bookings-v1'

export function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed.filter(isBooking) : []
  } catch {
    return []
  }
}

function isBooking(value: unknown): value is Booking {
  if (!value || typeof value !== 'object') return false
  const booking = value as Partial<Booking>
  return typeof booking.id === 'string' &&
    typeof booking.meetingId === 'string' &&
    typeof booking.startInstant === 'string' &&
    typeof booking.hostTimeZone === 'string' &&
    typeof booking.inviteeTimeZone === 'string' &&
    typeof booking.attendeeName === 'string' &&
    typeof booking.attendeeEmail === 'string' &&
    typeof booking.durationMinutes === 'number'
}

export function saveBooking(booking: Booking): Booking[] {
  const current = loadBookings()
  const next = [...current, booking]
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
