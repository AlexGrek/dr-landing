import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import drinkOptions from '../config/drinkOptions.json'
import dressCodeOptions from '../config/dressCodeOptions.json'
import activityOptions from '../config/activityOptions.json'
import './AdminPanel.less'

function parseJSON(str) {
  if (!str) return null
  try { return JSON.parse(str) } catch { return str }
}

// Inline two-step confirmation button — no modals, no browser dialogs
function ConfirmButton({ label, confirmLabel, onConfirm, disabled, className }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const timerRef = useRef(null)

  function handleFirst(e) {
    e.stopPropagation()
    setConfirming(true)
    timerRef.current = setTimeout(() => setConfirming(false), 3000)
  }

  async function handleConfirm(e) {
    e.stopPropagation()
    clearTimeout(timerRef.current)
    setConfirming(false)
    setBusy(true)
    try { await onConfirm() } finally { setBusy(false) }
  }

  function handleCancel(e) {
    e.stopPropagation()
    clearTimeout(timerRef.current)
    setConfirming(false)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (confirming) {
    return (
      <span className={`confirm-btn-group ${className || ''}`}>
        <button className="confirm-btn confirm-btn--yes" onClick={handleConfirm}>
          {confirmLabel || 'Confirm'}
        </button>
        <button className="confirm-btn confirm-btn--no" onClick={handleCancel}>
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      className={`delete-btn ${className || ''}`}
      onClick={handleFirst}
      disabled={disabled || busy}
    >
      {busy ? 'Deleting…' : label}
    </button>
  )
}

function PrefsDetail({ label, value, emoji }) {
  const parsed = parseJSON(value)
  if (!parsed) return null
  const items = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object'
    ? Object.entries(parsed).map(([k, v]) => `${k}: ${v}`)
    : [String(parsed)]
  if (!items.length) return null
  return (
    <div className="guest-detail-row">
      <span className="guest-detail-label">{emoji} {label}</span>
      <div className="guest-detail-tags">
        {items.map((item, i) => <span key={i} className="guest-tag">{item}</span>)}
      </div>
    </div>
  )
}

function GuestModal({ guest, onClose, onDelete }) {
  async function doDelete() {
    const res = await fetch(`/api/registrations/${guest.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed')
    onDelete(guest.id)
    onClose()
  }

  return (
    <motion.div
      className="guest-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="guest-modal"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="guest-modal-header">
          <div className="guest-modal-avatar">
            {guest.avatar ? (
              <img src={guest.avatar} alt={guest.name} />
            ) : (
              <span>{guest.name[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="guest-modal-name">{guest.name}</h2>
            <code className="code-text">{guest.invitation_code}</code>
          </div>
          <button className="guest-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="guest-modal-body">
          {guest.arrival_time && (
            <div className="guest-detail-row">
              <span className="guest-detail-label">🕐 Arrival</span>
              <span className="guest-detail-value">{guest.arrival_time}</span>
            </div>
          )}
          <div className="guest-detail-row">
            <span className="guest-detail-label">📅 Registered</span>
            <span className="guest-detail-value">
              {new Date(guest.created_at).toLocaleString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          <PrefsDetail label="Drinks" value={guest.drink_prefs} emoji="🍹" />
          <PrefsDetail label="Dress code" value={guest.dress_code_prefs} emoji="👔" />
          <PrefsDetail label="Activities" value={guest.activity_prefs} emoji="🎯" />
          {guest.additional_info && (
            <div className="guest-detail-row guest-detail-row--block">
              <span className="guest-detail-label">👥 Notes</span>
              <p className="guest-detail-notes">{guest.additional_info}</p>
            </div>
          )}
        </div>

        <div className="guest-modal-footer">
          <ConfirmButton
            label="🗑 Delete guest"
            confirmLabel="Yes, delete"
            onConfirm={doDelete}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

const GITHUB_BASE = 'https://github.com/AlexGrek/dr-landing/blob/main/frontend/src/config'

const CHART_CONFIGS = [
  {
    key: 'drink_prefs',
    label: '🍹 Drink Preferences',
    color: '#ffa07a',
    options: drinkOptions,
    githubUrl: `${GITHUB_BASE}/drinkOptions.json`,
  },
  {
    key: 'dress_code_prefs',
    label: '👔 Dress Code Preferences',
    color: '#87ceeb',
    options: dressCodeOptions,
    githubUrl: `${GITHUB_BASE}/dressCodeOptions.json`,
  },
  {
    key: 'activity_prefs',
    label: '🎯 Activity Preferences',
    color: '#90ee90',
    options: activityOptions,
    githubUrl: `${GITHUB_BASE}/activityOptions.json`,
  },
]

function countPrefs(registrations, key) {
  const counts = {}
  for (const reg of registrations) {
    const parsed = parseJSON(reg[key])
    if (!Array.isArray(parsed)) continue
    for (const item of parsed) {
      counts[item] = (counts[item] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{payload[0].payload.name}</span>
      <span className="chart-tooltip-count">{payload[0].value}</span>
    </div>
  )
}

function PrefsHistograms({ registrations }) {
  if (!registrations.length) return null
  return (
    <motion.div
      className="prefs-histograms"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <h2 className="histograms-title">Preference Stats</h2>
      <div className="histograms-grid">
        {CHART_CONFIGS.map(({ key, label, color }) => {
          const data = countPrefs(registrations, key)
          if (!data.length) return (
            <div key={key} className="histogram-card">
              <h3 className="histogram-card-title">{label}</h3>
              <p className="histogram-empty">No data yet</p>
            </div>
          )
          return (
            <div key={key} className="histogram-card">
              <h3 className="histogram-card-title">{label}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#888', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={48}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#666', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={color}
                        fillOpacity={1 - i * (0.55 / Math.max(data.length - 1, 1))}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function PrefsOptionsList() {
  return (
    <motion.div
      className="prefs-options-list"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <h2 className="histograms-title">Available Options</h2>
      <div className="histograms-grid">
        {CHART_CONFIGS.map(({ key, label, color, options, githubUrl }) => (
          <div key={key} className="histogram-card">
            <div className="options-card-header">
              <h3 className="histogram-card-title">{label}</h3>
              <a
                className="options-github-link"
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Edit on GitHub"
              >
                <svg className="options-github-icon" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                    0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                    -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                    .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                    -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
                    .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
                    .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                    0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                .json
              </a>
            </div>
            <div className="options-tags">
              {options.map((opt, i) => (
                <span key={i} className="options-tag" style={{ borderColor: color + '55', color }}>
                  {opt}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function AdminPanel() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('created')
  const [selected, setSelected] = useState(null)

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
    if (sortBy === 'created') return new Date(b.created_at) - new Date(a.created_at)
    return a.name.localeCompare(b.name)
  })

  function handleDelete(id) {
    setRegistrations(prev => prev.filter(r => r.id !== id))
  }

  async function doDeleteAll() {
    const res = await fetch('/api/registrations', { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed')
    setRegistrations([])
  }

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
              <ConfirmButton
                label="🗑 Delete all"
                confirmLabel={`Delete all ${registrations.length}`}
                onConfirm={doDeleteAll}
                disabled={registrations.length === 0}
              />
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
                    className="table-row table-row--clickable"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelected(reg)}
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
                        {(() => {
                          const drinks = parseJSON(reg.drink_prefs)
                          const dress = parseJSON(reg.dress_code_prefs)
                          const acts = parseJSON(reg.activity_prefs)
                          return (<>
                            {Array.isArray(drinks) && drinks.length > 0 && (
                              <span className="badge badge-drink">🍹 <span className="badge-count">{drinks.length}</span></span>
                            )}
                            {Array.isArray(dress) && dress.length > 0 && (
                              <span className="badge badge-dress">👔 <span className="badge-count">{dress.length}</span></span>
                            )}
                            {Array.isArray(acts) && acts.length > 0 && (
                              <span className="badge badge-activity">🎯 <span className="badge-count">{acts.length}</span></span>
                            )}
                            {reg.additional_info && (
                              <span className="badge badge-guests">👥</span>
                            )}
                          </>)
                        })()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <PrefsHistograms registrations={registrations} />
            <PrefsOptionsList />

            <a href="/" className="back-link">← Back to Landing Page</a>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <GuestModal
            guest={selected}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
