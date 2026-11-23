export type MeetingConfig = {
  id: string
  title: string
  hostName: string
  hostInitials: string
  hostTimeZone: string
  durationMinutes: number
  startHour: number
  endHour: number
  slotStepMinutes: number
  workingDays: number[]
}

export const meeting: MeetingConfig = {
  id: 'product-conversation',
  title: 'Product conversation',
  hostName: 'Maya Raman',
  hostInitials: 'MR',
  hostTimeZone: 'Europe/London',
  durationMinutes: 30,
  startHour: 9,
  endHour: 17,
  slotStepMinutes: 30,
  workingDays: [1, 2, 3, 4, 5],
}
