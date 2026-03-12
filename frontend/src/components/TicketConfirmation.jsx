import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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
        <h3 className="ticket-confirmation__title">Take a screenshot!</h3>
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
              className="ticket-confirmation__qr"
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
              Zhk Slavutych 2.0<br />вул. Зарічна, 6<br />Kyiv
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
    </div>
  )
}
