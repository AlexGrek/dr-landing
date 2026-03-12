import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './VerifyRegistration.less'

const MAPS_URL = 'https://www.google.com/maps/search/вул.+Зарічна+6+Київ'

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
    'LOCATION:Wabi Sabi Space\\, вул. Зарічна 6\\, Kyiv',
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

const DRINK_OPTIONS = [
  { id: 'wine',      label: 'Wine',        icon: '🍷' },
  { id: 'cocktails', label: 'Cocktails',   icon: '🍸' },
  { id: 'beer',      label: 'Beer',        icon: '🍺' },
  { id: 'champagne', label: 'Champagne',   icon: '🥂' },
  { id: 'soft',      label: 'Soft drinks', icon: '🧃' },
  { id: 'noalcohol', label: 'No alcohol',  icon: '🚫' },
  { id: 'pizza',     label: 'Pizza',       icon: '🍕' },
  { id: 'sushi',     label: 'Sushi',       icon: '🍣' },
  { id: 'sweets',    label: 'Sweets',      icon: '🧁' },
  { id: 'salads',    label: 'Salads',      icon: '🥗' },
]

const ACTIVITY_OPTIONS = [
  { id: 'dancing',     label: 'Dancing',     icon: '💃' },
  { id: 'live_music',  label: 'Live Music',  icon: '🎵' },
  { id: 'board_games', label: 'Board Games', icon: '🎲' },
  { id: 'karaoke',     label: 'Karaoke',     icon: '🎤' },
  { id: 'photo_booth', label: 'Photo Booth', icon: '📸' },
  { id: 'chill',       label: 'Chill Zone',  icon: '🛋️' },
  { id: 'billiards',   label: 'Billiards',   icon: '🎱' },
  { id: 'rooftop',     label: 'Rooftop',     icon: '🌙' },
]

function parsePrefs(json) {
  try { return JSON.parse(json) } catch { return [] }
}

function PrefChips({ json, options }) {
  const ids = parsePrefs(json)
  if (!ids.length) return <p className="preference pref-empty">No preference</p>
  return (
    <div className="pref-chips">
      {ids.map(id => {
        const opt = options.find(o => o.id === id)
        return opt ? (
          <span key={id} className="pref-chip">
            <span className="pref-chip__icon">{opt.icon}</span>
            {opt.label}
          </span>
        ) : null
      })}
    </div>
  )
}

export default function VerifyRegistration({ code }) {
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await fetch(`/api/register/${code}`)
        if (!res.ok) {
          setError('Registration not found')
          setLoading(false)
          return
        }
        const data = await res.json()
        setRegistration(data)
        setError(null)
      } catch (err) {
        setError('Failed to load registration')
      } finally {
        setLoading(false)
      }
    }

    fetchRegistration()
  }, [code])

  return (
    <div className="verify-page">
      <div className="verify-container">
        <motion.div
          className="verify-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="verify-title">Your Registration</h1>
          <p className="verify-code">Code: {code}</p>
        </motion.div>

        {loading && (
          <motion.div
            className="verify-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner" />
            <p>Loading your registration...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="verify-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="error-icon">⚠️</p>
            <p className="error-message">{error}</p>
            <a href="/" className="back-link">← Back to Landing Page</a>
          </motion.div>
        )}

        {registration && !loading && (
          <motion.div
            className="verify-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="verify-card">
              <div className="card-section">
                <h3 className="section-title">Guest Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Name</span>
                    <span className="value">{registration.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Created</span>
                    <span className="value">
                      {new Date(registration.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {registration.arrival_time && (
                <div className="card-section">
                  <h3 className="section-title">Arrival Time</h3>
                  <p className="arrival-time">{registration.arrival_time}</p>
                </div>
              )}

              {registration.drink_prefs && (
                <div className="card-section">
                  <h3 className="section-title">Food & Drinks</h3>
                  <PrefChips json={registration.drink_prefs} options={DRINK_OPTIONS} />
                </div>
              )}

              {registration.activity_prefs && (
                <div className="card-section">
                  <h3 className="section-title">Activities</h3>
                  <PrefChips json={registration.activity_prefs} options={ACTIVITY_OPTIONS} />
                </div>
              )}

              {registration.additional_info && (
                <div className="card-section">
                  <h3 className="section-title">Additional Guests</h3>
                  <p className="additional-info">{registration.additional_info}</p>
                </div>
              )}

              {registration.avatar && (
                <div className="card-section">
                  <h3 className="section-title">Avatar</h3>
                  <p className="avatar">{registration.avatar}</p>
                </div>
              )}

              <div className="card-section">
                <h3 className="section-title">Location</h3>
                <p className="verify-address">
                  Wabi Sabi Space<br />
                  Zhk Slavutych 2.0, вул. Зарічна, 6<br />
                  Kyiv
                </p>
              </div>
            </div>

            <div className="verify-actions">
              <a
                className="verify-action-btn"
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                ⛩ Google Maps
              </a>
              <button
                className="verify-action-btn"
                onClick={() => downloadCalendar(registration.arrival_time)}
              >
                📅 Add to Calendar
              </button>
            </div>

            <a href="/" className="back-link">← Back to Landing Page</a>
          </motion.div>
        )}
      </div>
    </div>
  )
}
