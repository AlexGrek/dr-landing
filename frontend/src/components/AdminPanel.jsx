import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './AdminPanel.less'

export default function AdminPanel() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('created')

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch('/api/registrations')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setRegistrations(data.registrations || [])
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  const sortedReg = [...registrations].sort((a, b) => {
    if (sortBy === 'created') {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="admin-page">
      <div className="admin-container">
        <motion.div
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="admin-title">🎂 Birthday Registrations</h1>
          <p className="admin-subtitle">Total: {registrations.length}</p>
        </motion.div>

        {loading && (
          <motion.div className="admin-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="spinner" />
            <p>Loading registrations...</p>
          </motion.div>
        )}

        {error && (
          <motion.div className="admin-error" initial={{ opacity: 0 }}>
            <p>{error}</p>
          </motion.div>
        )}

        {!loading && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="admin-controls">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="created">Sort by Date (Newest)</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>

            <div className="registrations-table">
              <div className="table-header">
                <div className="col-name">Name</div>
                <div className="col-code">Code</div>
                <div className="col-time">Arrival Time</div>
                <div className="col-date">Created</div>
                <div className="col-prefs">Preferences</div>
              </div>

              <div className="table-body">
                {sortedReg.map((reg, idx) => (
                  <motion.div
                    key={reg.id}
                    className="table-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="col-name">
                      <span className="name-text">{reg.name}</span>
                    </div>
                    <div className="col-code">
                      <code className="code-text">{reg.invitation_code}</code>
                    </div>
                    <div className="col-time">
                      {reg.arrival_time ? (
                        <span>{reg.arrival_time}</span>
                      ) : (
                        <span className="na">—</span>
                      )}
                    </div>
                    <div className="col-date">
                      {new Date(reg.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="col-prefs">
                      <div className="prefs-badges">
                        {reg.drink_prefs && (
                          <span className="badge badge-drink">🍹</span>
                        )}
                        {reg.dress_code_prefs && (
                          <span className="badge badge-dress">👔</span>
                        )}
                        {reg.activity_prefs && (
                          <span className="badge badge-activity">🎯</span>
                        )}
                        {reg.additional_info && (
                          <span className="badge badge-guests">👥</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <a href="/" className="back-link">← Back to Landing Page</a>
          </motion.div>
        )}
      </div>
    </div>
  )
}
