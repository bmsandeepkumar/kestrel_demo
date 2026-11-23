export type Booking = {
  id: string
  meetingId: string
  startInstant: string
  durationMinutes: number
  hostTimeZone: string
  inviteeTimeZone: string
  attendeeName: string
  attendeeEmail: string
}

export function validateAttendee(name: string, email: string): string | null {
  if (!name.trim()) return 'Enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.'
  return null
}

export function isReserved(bookings: Booking[], meetingId: string, startInstant: string): boolean {
  return bookings.some(booking => booking.meetingId === meetingId && booking.startInstant === startInstant)
}
