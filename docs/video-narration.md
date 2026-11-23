# Video narration: time-zone-safe booking

Use this as a spoken script for a roughly two-minute screen recording. The **On screen** lines are cues, not words to read. Use fictional attendee details. Record the [live prototype](https://web-production-6e3dcaf2.up.railway.app/), not the clickable draft in `cx/`.

## 0:00–0:22 — The customer problem

**On screen:** Open the booking page. Keep the meeting type and host time zone visible.

> “A scheduling product loses trust when host and invitee disagree on the meeting time. Kestrel customers reported one-hour shifts, wrong-day availability, and unclear reminders. Time-zone complaints came from 15 identifiable paying accounts, representing about 766 thousand dollars in annual contract value. That is affected account value, not revenue we can claim to save.”

## 0:22–0:46 — Why this feature

**On screen:** Point to the host’s `Europe/London` zone and the invitee’s zone selector.

> “I focused on booking, where customers need certainty. Maya’s working hours are defined in London time. Invitees choose their own time zone, and every slot is labelled in that zone. Both people should see one meeting at the same exact moment.”

## 0:46–1:13 — Show the daylight-saving difference

**On screen:** Select **Before clocks change**, then **After clocks change**. If your invitee zone is not `Asia/Calcutta`, select it first. Show the first morning London slot in each case.

> “Watch the 9 a.m. London slot. Before the UK clocks change, it is 2:30 p.m. in India. Afterward, it is 1:30 p.m. The app uses the time-zone rule for the meeting date, instead of assuming today’s offset still applies.”

## 1:13–1:43 — Complete the customer journey

**On screen:** On **After clocks change**, select the `1:30 pm` India slot. Show the side-by-side summary. Continue, enter a fictional name and email, then confirm.

> “I’ll select this slot. Before confirming, I can compare my local date and time with Maya’s London date and time. The booking keeps one underlying instant and displays it in both zones. I enter my details and confirm. The confirmation repeats both times, with no offset to guess.”

## 1:43–2:00 — Scope and close

**On screen:** Keep the confirmation visible. If time allows, reload once to show it persists in this browser.

> “This login-free prototype demonstrates new bookings and stores them in this browser. Production needs a shared database and atomic slot reservation. Existing calendar-sync and reminder defects need separate fixes. Here, customers can confidently book from selection through confirmation.”

## Recording notes

- Speak naturally; the timestamps are pacing guides. Keep the final upload under two minutes if using it for the challenge submission.
- If the browser displays `Asia/Kolkata` instead of `Asia/Calcutta`, say “India” while recording. Both names can refer to the same IANA zone rules in this environment.
- Do not say that calendar invites, reminders, cross-browser double-booking protection, or historical booking repairs are implemented.
- If you want to mention the build decision in a longer YouTube version: the first clickable UX draft used hard-coded London offsets; the React implementation replaced those with Temporal and named IANA zones, with tests for daylight-saving gaps and repeated hours.
