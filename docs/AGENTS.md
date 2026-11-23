# Agent instructions: Kestrel booking prototype

## Mission and source of truth

Build a public, login-free, customer-facing prototype of the **time-zone-safe booking flow** described in `docs/requirements.md`. The challenge brief is `kestrel-data-pack/BRIEF.md`; the CSV files are research evidence, not application data. Keep the prototype small enough to finish and demonstrate in two minutes. If these instructions conflict with the requirements or a direct user instruction, follow the more specific, newer instruction and update this file when the architecture changes.

The deliverable is a working booking experience, not a dashboard or a report. A reviewer must be able to choose a time zone, select a slot, enter attendee details, confirm a booking, and see an unambiguous confirmation.

## Agreed decisions

- **Stack:** React, TypeScript, and Vite. Use a simple single-page app and plain CSS or CSS modules. Avoid a large UI framework unless a real need emerges.
- **Time calculations:** `@js-temporal/polyfill` with named IANA time zones. Keep all conversion and DST handling in one domain module.
- **Persistence:** Browser `localStorage` for the prototype. State clearly in the UI or supporting copy that this is a browser-local demo. A real product needs a shared database and server-side, atomic slot reservation.
- **Host configuration:** One seeded host, meeting type, duration, IANA time zone, and weekly working-hours schedule. No host administration screen.
- **Hosting:** Railway, serving the Vite production build as a public site.
- **Visual direction:** Clean, responsive scheduling product UI. Prioritize readable date, time, and zone labels over decorative effects.
- **Verification:** Focused automated tests for time-zone and booking rules, followed by a manual end-to-end demo.

## Solution architecture

```text
Seeded host + working hours
          │
          ▼
Slot generation in host local zone ──► Temporal.Instant for each valid slot
          │                                      │
          │                                      ├──► render in invitee zone
          │                                      └──► render in host zone
          ▼
Available slot list ◄── browser-local bookings
          │
          ▼
Attendee form ──► validate + recheck slot ──► save booking ──► confirmation
```

Use a domain layer independent of React for slot generation, conversion, formatting inputs, and booking validation. React components should receive already-resolved slot objects and render them. Treat the selected slot as an exact instant; a change of display zone must never change that instant. Generate availability from the host's local date and hours using the host's IANA zone, then convert each valid result to an instant. Use the offset on the meeting date, not the current offset. Reject nonexistent spring-forward local times. For repeated fall-back times, either label each occurrence with its offset or exclude the ambiguous hour; document the chosen rule and test it.

Store serializable booking records with at least `id`, `startInstant` (ISO UTC string), `durationMinutes`, `hostTimeZone`, `inviteeTimeZone`, `attendeeName`, and `attendeeEmail`. The canonical identity of a slot is its instant plus meeting type or host. Keep a versioned local-storage key so stale demo data can be handled safely. Do not use `Date` parsing of zone-less strings for scheduling logic.

The browser-local reservation check prevents duplicate selection only in the same browser storage. Do not describe it as protection against bookings from multiple browsers. Production architecture would expose availability and booking APIs backed by a database transaction or uniqueness constraint, then send real confirmations from the server.

## Planned folder structure

Create only folders needed by the implementation; keep the existing data pack and documentation in place.

```text
/
├── docs/
│   ├── AGENTS.md
│   ├── plan.md
│   ├── recording-script.md
│   ├── requirements.md
│   └── submission.md
├── kestrel-data-pack/        # challenge evidence; do not import CSVs into the app
├── cx/                       # standalone clickable UX draft
│   └── index.html
├── public/                   # static assets, if needed
├── src/
│   ├── app/                  # app shell and booking flow state
│   ├── components/           # zone selector, date/slot list, form, confirmation
│   ├── domain/               # Temporal conversion, availability, booking rules
│   ├── data/                 # seeded host and meeting configuration
│   ├── storage/              # versioned localStorage adapter
│   ├── styles/               # global styles and design tokens
│   └── main.tsx
├── tests/                    # focused domain and flow tests
├── index.html
├── package.json
└── vite.config.ts
```

Prefer clear, small modules to extra layers or generic abstractions. A client-side router is unnecessary unless the final flow truly needs distinct URLs.

## User experience rules

- Detect the browser's IANA zone if available, show it explicitly, and allow the invitee to change it. Require a choice if detection fails.
- Show the full date, clock time, and named zone for the invitee. Before confirmation, also show the host-local date and time. A date may differ across zones; show each date rather than assuming they match.
- Keep the selected instant stable when the invitee changes zones. Refresh visible date and time labels from that instant.
- Make form errors and unavailable-slot messages clear. Preserve valid form input if the user must choose another slot.
- Confirm the booking on screen with both zones, duration, and attendee details. Do not imply that an email or calendar invite was sent unless the app actually sends one.
- Use accessible labels, keyboard-operable controls, visible focus states, and responsive layouts. Avoid abbreviations such as `EST` as the only zone label.
- Make the demo's local-storage limitation visible without interrupting the booking task.

## Testing and completion checks

Use Vitest for focused domain tests. Cover at least:

1. A host slot renders as the same instant in two different IANA zones, including a date change where applicable.
2. Switching the invitee zone changes only the display, not the selected `startInstant`.
3. A daylight-saving transition uses the date-specific offset and does not offer nonexistent local times; test the chosen fall-back rule.
4. A saved booking reloads from local storage, keeps its instant, and removes that slot from that browser's availability.
5. Invalid attendee input and a newly unavailable slot produce useful errors.

Before delivery, run the project's test, typecheck, and production build commands. Manually complete the booking flow in a browser at desktop and mobile widths. Check the production build locally with Vite preview. Stop adding features once the requirements and these checks pass.

## Railway deployment workflow

Keep `package.json` scripts for development, tests, typecheck, and `npm run build`. Vite's build output is `dist/`. Configure Railway to build the app and serve that directory on Railway's `$PORT`, with single-page-app fallback. A straightforward option from Railway's documentation is the production dependency `serve` and start command `serve --single --listen $PORT dist`; verify Railway's current guidance when deploying.

Deploy the repository as one Railway service, generate a public domain, and open that domain in a fresh browser session without logging in. Verify the booking flow at the public URL, including a page reload after confirmation. Confirm that no secret or private key is bundled into client-side `VITE_` variables. If deployment settings change, document the actual build and start commands in the repository.

## Scope guardrails

- Do not build a dashboard, calendar-provider sync, recurring bookings, messaging delivery, payment collection, or host admin features for this prototype.
- Do not claim that historical wrong-time bookings, reminder defects, or third-party calendar sync problems are fixed by this demo.
- Do not introduce a backend or database for the challenge prototype unless the user changes the agreed scope.
- Keep all claims in the submission grounded in the supplied brief and data. Describe affected account value as evidence of importance, not guaranteed retention.

## Reference documentation

- Temporal zone and DST semantics: https://tc39.es/proposal-temporal/docs/zoneddatetime.html
- Railway Vite start-command guidance: https://docs.railway.com/deployments/troubleshooting/no-start-command-could-be-found
- Vite static build and preview: https://vite.dev/guide/static-deploy.html
