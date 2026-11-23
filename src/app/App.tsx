import { useMemo, useState, type FormEvent } from 'react'
import { meeting } from '../data/meeting'
import { isReserved, validateAttendee, type Booking } from '../domain/booking'
import {
  browserTimeZone,
  formatClock,
  formatDateTime,
  formatHostDate,
  generateSlots,
  nextWorkingDate,
  type Slot,
} from '../domain/time'
import { loadBookings, saveBooking } from '../storage/bookings'

type Step = 'pick' | 'details' | 'done'
type DateOption = { label: string; date: string }

const commonZones = [
  'Europe/London',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Berlin',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Asia/Singapore',
]

function lastConfirmation(): Booking | null {
  try {
    const id = sessionStorage.getItem('kestrel-last-booking')
    return loadBookings().find(booking => booking.id === id) || null
  } catch {
    return null
  }
}

function Summary({ booking }: { booking: Booking }) {
  return (
    <div className="summary">
      <p className="summary-title">{meeting.title} · {booking.durationMinutes} minutes</p>
      <p><strong>Your time:</strong> {formatDateTime(booking.startInstant, booking.inviteeTimeZone)}</p>
      <p><strong>Maya’s time:</strong> {formatDateTime(booking.startInstant, booking.hostTimeZone)}</p>
      <p><strong>Booked for:</strong> {booking.attendeeName} · {booking.attendeeEmail}</p>
    </div>
  )
}

export default function App() {
  const detectedZone = useMemo(browserTimeZone, [])
  const zones = useMemo(() => {
    const supported = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []
    return [...new Set([...(detectedZone ? [detectedZone] : []), ...commonZones, ...supported])]
  }, [detectedZone])
  const dateOptions = useMemo<DateOption[]>(() => [
    { label: 'Next available', date: nextWorkingDate(meeting) },
    { label: 'Before clocks change', date: '2027-03-26' },
    { label: 'After clocks change', date: '2027-03-29' },
    { label: 'Autumn change', date: '2027-11-01' },
  ], [])
  const [date, setDate] = useState(dateOptions[0].date)
  const [inviteeZone, setInviteeZone] = useState(detectedZone || '')
  const [selected, setSelected] = useState<Slot | null>(null)
  const [bookings, setBookings] = useState<Booking[]>(loadBookings)
  const [confirmation, setConfirmation] = useState<Booking | null>(lastConfirmation)
  const [step, setStep] = useState<Step>(confirmation ? 'done' : 'pick')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [pickError, setPickError] = useState('')

  const slots = useMemo(() => generateSlots(meeting, date), [date])
  const candidate = selected && inviteeZone ? {
    id: '',
    meetingId: meeting.id,
    startInstant: selected.startInstant,
    durationMinutes: meeting.durationMinutes,
    hostTimeZone: meeting.hostTimeZone,
    inviteeTimeZone: inviteeZone,
    attendeeName: name.trim(),
    attendeeEmail: email.trim(),
  } satisfies Booking : null

  function chooseDate(next: string) {
    setDate(next)
    setSelected(null)
    setPickError('')
  }

  function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const validationError = validateAttendee(name, email)
    if (validationError) {
      setError(validationError)
      return
    }
    if (!candidate) return
    if (isReserved(loadBookings(), meeting.id, candidate.startInstant)) {
      setSelected(null)
      setPickError('That time was just booked. Please choose another.')
      setStep('pick')
      setBookings(loadBookings())
      return
    }
    const booking = { ...candidate, id: crypto.randomUUID() }
    try {
      const next = saveBooking(booking)
      sessionStorage.setItem('kestrel-last-booking', booking.id)
      setBookings(next)
      setConfirmation(booking)
      setStep('done')
    } catch {
      setError('We could not save this booking in your browser. Please try again.')
    }
  }

  function bookAnother() {
    try { sessionStorage.removeItem('kestrel-last-booking') } catch { /* Storage may be unavailable. */ }
    setConfirmation(null)
    setSelected(null)
    setName('')
    setEmail('')
    setError('')
    setPickError('')
    setStep('pick')
  }

  return (
    <>
      <header className="topbar">
        <div className="brand"><span className="mark" aria-hidden="true">✳</span>Kestrel</div>
        <div className="topnote">Clear time. Better meetings.</div>
      </header>
      <main>
        <p className="eyebrow">Book with confidence</p>
        <h1 className="title">One meeting. Two time zones.<br />The same moment.</h1>
        <p className="sub">Choose a time that works for you. We’ll show exactly when it is for both you and your host, even when the clocks change.</p>
        <div className="layout">
          <aside className="details">
            <div className="avatar">{meeting.hostInitials}</div>
            <p className="host">{meeting.hostName} · Kestrel</p>
            <h2 className="meeting">{meeting.title}</h2>
            <div className="meta"><span className="icon" aria-hidden="true">◷</span><span>{meeting.durationMinutes} minutes</span></div>
            <div className="meta"><span className="icon" aria-hidden="true">◎</span><span>Video meeting</span></div>
            <div className="meta"><span className="icon" aria-hidden="true">◉</span><span>Host time zone: {meeting.hostTimeZone}</span></div>
            <div className="divider" />
            <p className="promise"><strong>Your time stays your time.</strong> We check the host’s working hours in London, then display the same booking in your chosen zone.</p>
            <div className="working">Demo host hours<br /><strong>Weekdays · 9:00 am–5:00 pm London time</strong></div>
          </aside>
          <section className="panel" aria-live="polite">
            {step === 'pick' && (
              <div>
                <p className="step">Step 1 of 2</p><h2>Pick a time</h2>
                <p className="hint">Choose a host date, then select a time shown in your time zone.</p>
                <span className="section-label">Available dates in London</span>
                <div className="dates">
                  {dateOptions.map(option => (
                    <button type="button" key={option.label} className={`date-btn${date === option.date ? ' active' : ''}`} aria-pressed={date === option.date} onClick={() => chooseDate(option.date)}>
                      {option.label}<span>{formatHostDate(option.date, meeting.hostTimeZone)}</span>
                    </button>
                  ))}
                </div>
                <label className="custom-date">Or choose another host date
                  <input type="date" min={dateOptions[0].date} value={date} onChange={event => { if (event.target.value) chooseDate(event.target.value) }} />
                </label>
                <div className="zone-row">
                  <label className="section-label" htmlFor="zone">Show times in</label>
                  <div className="select-wrap"><select id="zone" value={inviteeZone} onChange={event => setInviteeZone(event.target.value)}>
                    {!detectedZone && <option value="">Choose your time zone</option>}
                    {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                  </select></div>
                  <p className="zone-help">Your selected time zone is shown on every slot. Change it any time.</p>
                </div>
                <span className="section-label">Available times</span>
                {pickError && <p className="error" role="alert">{pickError}</p>}
                {slots.length === 0 ? <p className="hint">No times are available on this host date. Choose another date.</p> :
                  <div className="slots">
                    {slots.map(slot => {
                      const reserved = isReserved(bookings, meeting.id, slot.startInstant)
                      const active = selected?.startInstant === slot.startInstant
                      return <button type="button" key={slot.startInstant} className={`slot${active ? ' active' : ''}`} disabled={reserved || !inviteeZone} aria-pressed={active} onClick={() => { setSelected(slot); setPickError('') }}>
                        {inviteeZone ? formatClock(slot.startInstant, inviteeZone) : 'Choose zone'}
                        <small>{reserved ? 'Booked' : inviteeZone}</small>
                      </button>
                    })}
                  </div>}
                {selected && inviteeZone && <div className="compare show">
                  <p className="compare-title">Same moment, in both places</p>
                  <div className="compare-grid">
                    <div><small>Your time</small><strong>{formatDateTime(selected.startInstant, inviteeZone)}</strong></div>
                    <div><small>Maya’s time</small><strong>{formatDateTime(selected.startInstant, meeting.hostTimeZone)}</strong></div>
                  </div>
                </div>}
                <div className="actions"><button className="primary" disabled={!selected || !inviteeZone} onClick={() => setStep('details')}>Continue →</button></div>
                <p className="demo-note">Prototype booking: saved only in this browser. No email or calendar invitation is sent.</p>
              </div>
            )}
            {step === 'details' && candidate && (
              <div>
                <p className="step">Step 2 of 2</p><h2>Your details</h2>
                <p className="hint">Review both times before you confirm.</p>
                <div className="summary">
                  <p className="summary-title">{meeting.title} · {meeting.durationMinutes} minutes</p>
                  <p><strong>Your time:</strong> {formatDateTime(candidate.startInstant, candidate.inviteeTimeZone)}</p>
                  <p><strong>Maya’s time:</strong> {formatDateTime(candidate.startInstant, candidate.hostTimeZone)}</p>
                </div>
                <form onSubmit={confirm} noValidate>
                  <label className="field">Your name<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required placeholder="Your full name" /></label>
                  <label className="field">Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" /></label>
                  <p className="error" role="alert">{error}</p>
                  <div className="actions"><button className="secondary" type="button" onClick={() => setStep('pick')}>← Back</button><button className="primary" type="submit">Confirm booking</button></div>
                </form>
                <p className="demo-note">This prototype shows an on-screen confirmation. It does not send email or calendar invitations.</p>
              </div>
            )}
            {step === 'done' && confirmation && (
              <div>
                <div className="success-icon" aria-hidden="true">✓</div>
                <p className="step">Booking confirmed</p><h2 className="success-head">You’re all set.</h2>
                <p className="hint">The same meeting time is shown for you and Maya.</p>
                <Summary booking={confirmation} />
                <div className="actions"><button className="secondary" onClick={bookAnother}>Book another time</button></div>
                <p className="demo-note">Saved in this browser only. Real bookings would use a shared database and atomic reservation.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
