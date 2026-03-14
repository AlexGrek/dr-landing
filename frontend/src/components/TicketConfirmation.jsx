import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const MAPS_URL = 'https://maps.app.goo.gl/bEvJxmD1Wt1GffAP9'

function downloadCalendar(arrivalTime) {
  const t = (arrivalTime || '15:00').replace(':', '')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Birthday Party 3.0//EN',
    'BEGIN:VEVENT',
    `DTSTART:20260322T${t}00`,
    'DTEND:20260322T230000',
    'SUMMARY:Birthday Party 3.0',
    'LOCATION:Wabi Sabi Space\\, вул. Зарічна 6\\, корпус 4\\, Kyiv',
    'DESCRIPTION:You are invited to Birthday Party 3.0!',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'birthday-party-3.0.ics'
  a.click()
  URL.revokeObjectURL(url)
}

export default function TicketConfirmation({ data }) {
  const [qrUrl, setQrUrl] = useState(null)
  const guestNames = [data.name, ...(data.partners || [])].filter(Boolean)

  useEffect(() => {
    // Fetch QR code from backend
    fetch(`/api/qr-image/${data.invitationCode}`)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        setQrUrl(url)
      })
      .catch(err => console.error('Failed to load QR code:', err))
  }, [data.invitationCode])

  return (
    <div className="ticket-confirmation">
      {/* Header */}
      <motion.div
        className="ticket-confirmation__header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="ticket-confirmation__title">Your ticket</h3>
        <p className="ticket-confirmation__subtitle">take a screenshot</p>
      </motion.div>

      {/* QR Code with appearance animation */}
      <motion.div
        className="ticket-confirmation__qr-wrapper"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ticket-confirmation__qr-bg">
          {qrUrl && (
            <img
              src={qrUrl}
              alt="Ticket QR Code"
              className="ticket-confirmation__qr ticket-confirmation__qr--downloadable"
              title="Click to download"
              onClick={() => {
                const a = document.createElement('a')
                a.href = qrUrl
                a.download = `ticket-${data.invitationCode}.png`
                a.click()
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Details section */}
      <motion.div
        className="ticket-confirmation__details"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Location */}
        <div className="ticket-confirmation__detail-item">
          <span className="ticket-confirmation__label">Location</span>
          <span className="ticket-confirmation__value">
            Wabi Sabi Space<br />
            <span className="ticket-confirmation__address">
              Zhk Slavutych 2.0<br />вул. Зарічна, 6, корпус 4<br />Kyiv
            </span>
          </span>
        </div>

        {/* Time */}
        <div className="ticket-confirmation__detail-item">
          <span className="ticket-confirmation__label">Time</span>
          <span className="ticket-confirmation__value">
            {data.arrivalTime || '15:00'} on March 22
          </span>
        </div>

        {/* Guest names */}
        <div className="ticket-confirmation__detail-item">
          <span className="ticket-confirmation__label">Guests</span>
          <span className="ticket-confirmation__value">
            {guestNames.map((name, i) => (
              <div key={i}>{name}</div>
            ))}
          </span>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="ticket-confirmation__actions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <a
          className="ticket-confirmation__action-btn"
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          ⛩ Google Maps
        </a>
        <button
          className="ticket-confirmation__action-btn"
          onClick={() => downloadCalendar(data.arrivalTime)}
        >
          📅 Add to Calendar
        </button>
      </motion.div>

      <motion.p
        className="ticket-confirmation__notice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        Ticket is required to visit the event.
        <br />
        Every ticket is unique — do not share.
        <br />
        <a
          className="ticket-confirmation__edit-link"
          href={`/verify/${data.invitationCode}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          edit
        </a>
      </motion.p>
    </div>
  )
}
