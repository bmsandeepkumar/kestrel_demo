# Build plan: Time-Zone-Safe Booking Flow

This checklist implements [requirements.md](requirements.md) using the architecture in [AGENTS.md](AGENTS.md). Check an item only after the work or validation has actually been completed. The target is a small, customer-facing prototype that can be shown in two minutes.

## 0. Review the UX prototype

- [x] Create a standalone clickable flow at `cx/index.html` with date selection, time-zone selection, slot selection, attendee form, and confirmation.
- [x] Include before and after daylight-saving example dates and a browser-local booking disclaimer.
- [x] Check the embedded JavaScript for syntax errors with `node --check`.
- [ ] Open the prototype in a browser and complete a manual click-through at desktop and mobile widths.
- [ ] Incorporate any UX feedback before building the React version.

## 1. Set up the app

- [x] Create the React + TypeScript + Vite app at the repository root without moving `docs/` or `kestrel-data-pack/`.
- [x] Add `@js-temporal/polyfill`, Vitest, and the scripts needed for development, tests, typechecking, and production build.
- [x] Create the app, domain, data, storage, and styles modules needed for this small implementation.
- [x] Seed one host, a meeting type and duration, an IANA host zone, and weekly working hours. Make dates around a daylight-saving transition easy to reach during the demo.

**Validate**

- [x] `npm run dev` starts without errors and returns the app page over HTTP (interactive browser click-through remains pending).
- [ ] The page identifies the seeded host and meeting type; the CSV evidence is not bundled into the app.

## 2. Implement time-safe availability

- [x] Generate slots from the host's local working hours using the host's named IANA time zone.
- [x] Represent each valid slot as a `Temporal.Instant`; derive host and invitee display values from that instant.
- [x] Detect and display the invitee's browser zone, with an explicit selector and a fallback when detection fails.
- [x] Keep a selected instant fixed when the invitee changes zones, even if the displayed calendar date changes.
- [x] Reject nonexistent spring-forward local times. Omit the ambiguous fall-back hour, as documented in `src/domain/time.ts`.
- [x] Show an empty state and a way to choose another date when no slots are available.

**Validate**

- [x] Two zone views of a slot resolve to the same UTC instant (automated test).
- [x] A daylight-saving example uses the offset for the meeting date, not today's offset (automated test).
- [x] A nonexistent local time is absent, and the chosen fall-back policy is unambiguous (automated test).
- [x] Host and invitee dates are both shown when they differ (automated test and UI rendering).

## 3. Complete the booking journey

- [x] Let an invitee select a slot and review the full date, time, and IANA zone for both parties.
- [x] Collect attendee name and email; show clear validation errors without losing valid input.
- [x] Recheck availability when the invitee confirms. If the slot is gone, explain it and return to the slot list.
- [x] Save a booking with a versioned `localStorage` key, UTC start instant, duration, both time zones, and attendee details.
- [x] Remove a booked slot from availability in the same browser and show a confirmation that survives page reload.
- [x] Label this as a browser-local prototype; explain that real bookings require shared database storage and atomic reservation.
- [x] Avoid suggesting that an email or calendar invite was sent unless delivery is implemented.

**Validate**

- [ ] A valid booking can be completed from start to finish without a login (browser click-through pending).
- [ ] Invalid form input is rejected; a valid correction succeeds.
- [ ] A booked slot cannot be booked again in the same browser, including after reload.
- [ ] The saved instant is unchanged when viewed in another time zone.
- [ ] The confirmation includes both full dates, times, zone names, duration, and attendee details.

## 4. Polish and test

- [x] Implement responsive layout, keyboard-operable controls, and visible focus styles; browser review remains below.
- [x] Add focused Vitest coverage for conversion, date changes, daylight-saving gaps and overlaps, booking validation, and persistence.
- [x] Run tests, typecheck, and production build; fix all failures.
- [ ] Walk through the built app with `npm run preview`, including the empty and error states (HTTP 200 and assets verified; interactive browser review pending).

**Validate**

- [ ] A manual browser walkthrough matches every acceptance criterion in `requirements.md`.
- [ ] No time display relies only on an abbreviation such as `EST` or an unlabeled UTC offset.
- [ ] The UI does not imply cross-browser booking protection or claim to fix historical calendar-sync defects.

## 5. Publish and prepare the submission

Public prototype: https://web-production-6e3dcaf2.up.railway.app/  
Source repository: https://github.com/bmsandeepkumar/kestrel_demo  
Railway build: `npm run build`; start: `npm start`.

- [x] Configure Railway project and web service to build the Vite app and serve `dist/` on its assigned port with single-page-app fallback.
- [x] Deploy to a public Railway domain and record the actual build and start commands used.
- [ ] Open the public link in a fresh browser session, complete a booking, and verify the confirmation after reload.
- [ ] Record a two-minute walkthrough: change the invitee zone, compare both local times, book near a daylight-saving change, and show confirmation.
- [x] Draft the submission note in 250 words or fewer: choice and evidence, what was left out, and one AI suggestion that was wrong or overruled.

**Validate**

- [ ] The public link opens without a login and works on desktop and mobile (HTTP 200 and static assets verified; interactive browser check pending).
- [ ] The recording is at most two minutes and shows the working feature rather than an analysis dashboard.
- [ ] The note makes no claim of guaranteed revenue retention or of repairs outside the prototype.

## Done when

All acceptance criteria in `requirements.md` pass, the public Railway URL works without a login, and the note and recording are ready to submit. Leave unchecked items visible if work remains; do not mark the project complete based on a local build alone.
