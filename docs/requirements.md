# Kestrel: Time-Zone-Safe Booking Flow

## Goal

Help an invitee and a host agree on the same meeting time, even when they are in different time zones or a daylight-saving change occurs. Build a small, working, customer-facing booking prototype for the Founder's Office challenge.

## Why this feature

Time-zone-related complaints appear across 15 identifiable paying accounts representing $766,530 in annual contract value. Customers report one-hour shifts, availability on the wrong day, and reminders that omit the time zone. Marlow Legal reports both a calendar mismatch and a daylight-saving failure; its listed renewal date is 10 December 2026. These figures come from `kestrel-data-pack/feedback.csv` and `kestrel-data-pack/accounts.csv`; they indicate affected account value, not revenue guaranteed to be saved.

The challenge asks for one working feature a Kestrel customer can use, rather than an analysis dashboard. The prototype must be accessible by link without a login.

## Users and core journey

- **Invitee:** Opens a booking link, sees available slots in their chosen time zone, selects one, enters their name and email, and receives a clear on-screen confirmation.
- **Host:** Has a configured meeting type, working hours, and an IANA time zone. The host's local working hours determine which slots are offered.

The primary demo scenario uses a host and invitee in different time zones and books a slot near a daylight-saving transition.

## MVP requirements

### 1. Time-zone selection and display

- Detect the invitee's browser time zone when available, display it explicitly, and let the invitee change it before choosing a slot.
- Use named IANA zones, such as `Europe/London` and `Asia/Kolkata`, rather than a fixed UTC offset or a country label.
- Show the selected date and each available slot in the invitee's chosen zone, with an unambiguous zone label. Show the corresponding host-local time before confirmation.
- If browser detection fails, require an explicit zone selection before displaying slots.

### 2. Correct slot calculation

- Define host availability as local working hours in the host's named time zone.
- Convert each offered slot to one UTC instant, then render that same instant in the host and invitee zones. Changing the invitee's zone must change the display, not the underlying instant.
- Apply the time-zone rules for the actual meeting date, including daylight-saving changes. Do not reuse today's offset for a future booking.
- Never offer a local host time that does not exist during a spring-forward transition. If a fall-back hour repeats, distinguish the two instants clearly or omit that ambiguous hour from the prototype's available slots.

### 3. Booking and confirmation

- Let the invitee select an available slot, provide a name and valid email address, and confirm the booking.
- Show a booking confirmation containing the date, time, and named time zone for both invitee and host, plus the meeting duration and attendee details.
- Store the selected UTC instant and both named time zones with the booking. The booking's instant must remain unchanged when the page is reopened in a different browser time zone.
- After confirmation, prevent the same slot from being selected again within the prototype's stored state. For a production implementation, booking creation must check availability atomically to prevent concurrent double bookings.

### 4. Failure and empty states

- Explain when no slots are available for a selected date and offer another date.
- Reject missing or malformed attendee details without losing the selected slot.
- If a slot becomes unavailable before confirmation, explain what happened and return the invitee to available slots.

## Acceptance criteria

1. A host-local slot and its invitee-local display resolve to the same UTC instant.
2. Switching the invitee from one time zone to another changes displayed times and dates where appropriate, while preserving the selected instant.
3. A booking on either side of a daylight-saving boundary uses the offset applicable on the meeting date; a nonexistent local time is never offered.
4. The booking page and confirmation explicitly identify both time zones. A screenshot of either must not leave the meeting time ambiguous.
5. A completed booking remains visible after a page reload in the prototype, and its slot is no longer available there.
6. A reviewer can complete the flow through a public link without creating an account.

## Prototype boundaries

- Use one realistic meeting type and a small seeded availability schedule. A lightweight local store is acceptable for the challenge demo; label its limitation clearly if bookings are not shared across browsers.
- Show an email or calendar-invite preview if useful, but do not claim that a message was sent unless the prototype actually sends it.
- Do not build an analytics dashboard, a full calendar-provider integration, recurring meetings, or a general repair of existing calendar-sync data in this prototype.
- Treat reported incorrect existing bookings and reminders as production defects requiring separate investigation. This prototype demonstrates the correct new-booking behavior; it does not prove those defects are fixed.

## Submission evidence

- Public, login-free prototype link.
- Two-minute recording: select a zone, compare host and invitee times, book a slot near a daylight-saving change, and show the confirmation.
- Note of at most 250 words covering the choice and evidence, what was left out, and one instance where an AI suggestion was wrong or overruled.

## Success signal after launch

Track time-zone-related support contacts and booking-time correction requests per 1,000 bookings. Monitor completed bookings by time-zone pair and daylight-saving period. Compare against a prelaunch baseline; the supplied data alone cannot establish that the feature reduces these failures.
