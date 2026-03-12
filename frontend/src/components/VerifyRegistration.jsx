import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './VerifyRegistration.less'

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
                  <h3 className="section-title">Drink Preferences</h3>
                  <p className="preference">{registration.drink_prefs}</p>
                </div>
              )}

              {registration.dress_code_prefs && (
                <div className="card-section">
                  <h3 className="section-title">Dress Code Preferences</h3>
                  <p className="preference">{registration.dress_code_prefs}</p>
                </div>
              )}

              {registration.activity_prefs && (
                <div className="card-section">
                  <h3 className="section-title">Activity Preferences</h3>
                  <p className="preference">{registration.activity_prefs}</p>
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
            </div>

            <a href="/" className="back-link">← Back to Landing Page</a>
          </motion.div>
        )}
      </div>
    </div>
  )
}
