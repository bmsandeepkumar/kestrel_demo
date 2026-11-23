# Submission note

I built a time-zone-safe booking flow. Invitees can choose their time zone, compare their meeting time with the host's, and confirm a booking that keeps the same exact instant across both views. The flow uses named IANA zones and checks the offset on the meeting date, including daylight-saving changes.

I chose this because time-zone complaints came from 15 identifiable paying accounts worth $766,530 in combined annual contract value. Customers described one-hour shifts, wrong-day availability, and ambiguous reminders. This is a core trust issue for a scheduling product. The value figure describes affected accounts, not revenue I can claim the feature will save.

I passed on dark mode despite more comments: its identifiable requests came from Starter accounts worth about $46,250 combined. I also passed on Salesforce custom objects because the 24 urgent notes had no matched paying account ID.

I left out calendar-provider integration, reminder delivery, recurring bookings, and a host admin screen. Browser storage makes this a working single-browser prototype; production would need a shared database and atomic slot reservation.

The AI-generated clickable draft hard-coded London offsets for its sample dates. I replaced that approach in the implementation with Temporal and IANA time-zone rules, and tested both daylight-saving gaps and repeated hours.
