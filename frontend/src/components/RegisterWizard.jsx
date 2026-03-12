import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Wine, Music, Clock, CheckCircle2 } from 'lucide-react'

const MAX_GUESTS = 8

const STAGES = [
  { Icon: Users, title: "Who's coming?",       accent: '#d9af5d' },
  { Icon: Wine, title: 'Food & Drinks',        accent: '#5dc4d9' },
  { Icon: Music, title: 'Activities',          accent: '#b05dd9' },
  { Icon: Clock, title: 'Arrival',             accent: '#e07a5f' },
  { Icon: CheckCircle2, title: 'Almost there!', accent: '#cede48' },
]

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

const ARRIVAL_TIMES = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00']

const slide = {
  enter: (dir) => ({ x: dir * 56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -56, opacity: 0 }),
}

// ── Stage 1: Names ────────────────────────────────────────────────────────────
function Stage1({ primaryName, setPrimaryName, partners, setPartners }) {
  const canAdd = 1 + partners.length < MAX_GUESTS

  return (
    <div className="wizard__stage-body">
      <div className="tickets__field">
        <input
          className="tickets__input"
          type="text"
          placeholder="Your name"
          value={primaryName}
          onChange={e => setPrimaryName(e.target.value)}
          autoComplete="name"
          autoFocus
        />
      </div>

      <AnimatePresence initial={false}>
        {partners.map((val, i) => (
          <motion.div
            key={i}
            className="tickets__field"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="tickets__partner-row">
              <input
                className="tickets__input"
                type="text"
                placeholder={`Partner ${i + 1}`}
                value={val}
                onChange={e => setPartners(p => p.map((x, idx) => idx === i ? e.target.value : x))}
                autoComplete="off"
              />
              <button
                className="tickets__remove-btn"
                onClick={() => setPartners(p => p.filter((_, idx) => idx !== i))}
                aria-label="Remove"
              >×</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {canAdd && (
        <button
          className="tickets__add-partner"
          onClick={() => setPartners(p => [...p, ''])}
        >
          + Add partner
          <span className="tickets__add-count">{1 + partners.length}/{MAX_GUESTS}</span>
        </button>
      )}
    </div>
  )
}

// ── Stage 2 & 3: Option checkboxes ────────────────────────────────────────────
function OptionGrid({ options, selected, onToggle }) {
  return (
    <div className="wizard__options">
      {options.map(({ id, label, icon }) => {
        const on = selected.includes(id)
        return (
          <div
            key={id}
            className={`wizard__option${on ? ' wizard__option--selected' : ''}`}
            onClick={() => onToggle(id)}
          >
            <span className="wizard__option-icon">{icon}</span>
            <span className="wizard__option-label">{label}</span>
            <div className="wizard__checkbox">
              {on && <span className="wizard__check-mark">✓</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Stage 4: Arrival time + textarea ──────────────────────────────────────────
function Stage4({ arrivalTime, setArrivalTime, additionalInfo, setAdditionalInfo }) {
  return (
    <div className="wizard__stage-body">
      <p className="wizard__sublabel">When will you arrive?</p>
      <div className="wizard__times">
        {ARRIVAL_TIMES.map(t => (
          <div
            key={t}
            className={`wizard__time${arrivalTime === t ? ' wizard__time--selected' : ''}`}
            onClick={() => setArrivalTime(t)}
          >{t}</div>
        ))}
      </div>
      <p className="wizard__sublabel">Anything else we should know?</p>
      <textarea
        className="tickets__input wizard__textarea"
        placeholder="Allergies, special requests, surprise ideas…"
        value={additionalInfo}
        onChange={e => setAdditionalInfo(e.target.value)}
        rows={3}
      />
    </div>
  )
}

// ── Stage 5: Review ───────────────────────────────────────────────────────────
function Stage5({ reviewItems, visibleReview }) {
  return (
    <div className="wizard__review">
      {reviewItems.map((item, i) => (
        <motion.div
          key={i}
          className="wizard__review-item"
          initial={{ opacity: 0 }}
          animate={{ opacity: visibleReview.includes(i) ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="wizard__review-label">{item.label}</span>
          <span className="wizard__review-value">{item.value}</span>
        </motion.div>
      ))}
    </div>
  )
}

// ── Submit button with loading bar ────────────────────────────────────────────
function SubmitButton({ submitting, onSubmit }) {
  return (
    <div className="wizard__submit-wrap">
      <AnimatePresence mode="wait">
        {!submitting ? (
          <motion.button
            key="btn"
            className="wizard__submit-btn"
            onClick={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Get Tickets ✨
          </motion.button>
        ) : (
          <motion.div
            key="bar"
            className="wizard__loading-bar-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="wizard__loading-bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2.4, ease: 'easeInOut' }}
            />
            <span className="wizard__loading-label">Getting you in…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main wizard ───────────────────────────────────────────────────────────────
export default function RegisterWizard({ onSuccess }) {
  const [stage, setStage] = useState(1)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [visibleReview, setVisibleReview] = useState([])

  const [primaryName, setPrimaryName] = useState('')
  const [partners, setPartners] = useState([])
  const [drinkPrefs, setDrinkPrefs] = useState([])
  const [activityPrefs, setActivityPrefs] = useState([])
  const [arrivalTime, setArrivalTime] = useState('15:00')
  const [additionalInfo, setAdditionalInfo] = useState('')

  const toggle = (arr, setArr, id) =>
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id])

  const reviewItems = [
    {
      label: 'Name',
      value: [primaryName, ...partners].filter(Boolean).join(', ') || '—',
    },
    {
      label: 'Food & Drinks',
      value: drinkPrefs.length
        ? drinkPrefs.map(id => DRINK_OPTIONS.find(o => o.id === id)?.label).join(', ')
        : 'No preference',
    },
    {
      label: 'Activities',
      value: activityPrefs.length
        ? activityPrefs.map(id => ACTIVITY_OPTIONS.find(o => o.id === id)?.label).join(', ')
        : 'No preference',
    },
    { label: 'Arrival time', value: arrivalTime },
    ...(additionalInfo.trim()
      ? [{ label: 'Additional info', value: additionalInfo }]
      : []),
  ]

  useEffect(() => {
    if (stage !== 5) { setVisibleReview([]); return }
    const timers = reviewItems.map((_, i) =>
      setTimeout(() => setVisibleReview(prev => [...prev, i]), i * 700)
    )
    return () => timers.forEach(clearTimeout)
  }, [stage])

  const goNext = () => { setDirection(1); setStage(s => s + 1) }
  const goBack = () => { setDirection(-1); setStage(s => s - 1) }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const body = {
        name: primaryName.trim(),
        arrival_time: arrivalTime,
        drink_prefs: JSON.stringify(drinkPrefs),
        activity_prefs: JSON.stringify(activityPrefs),
        additional_info: [
          partners.filter(n => n.trim()).length
            ? 'Partners: ' + partners.filter(n => n.trim()).join(', ')
            : '',
          additionalInfo,
        ].filter(Boolean).join('\n'),
      }
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        setTimeout(() => onSuccess({
          name: primaryName.trim(),
          partners: partners.filter(n => n.trim()),
          arrivalTime,
          invitationCode: data.invitation_code,
        }), 700)
      } else setSubmitting(false)
    } catch {
      setSubmitting(false)
    }
  }

  const cfg = STAGES[stage - 1]
  const canNext = stage === 1 ? primaryName.trim() !== '' : true

  return (
    <div className="wizard" style={{ '--stage-accent': cfg.accent }}>
      {/* Progress dots — hidden on stage 1 */}
      <div className="wizard__progress" style={{ visibility: stage > 1 ? 'visible' : 'hidden' }}>
        {STAGES.map((_, i) => (
          <div
            key={i}
            className={[
              'wizard__dot',
              i + 1 === stage ? 'wizard__dot--active' : '',
              i + 1 < stage ? 'wizard__dot--done' : '',
            ].filter(Boolean).join(' ')}
          />
        ))}
      </div>

      {/* Header */}
      <div className="wizard__header">
        <cfg.Icon className="wizard__icon" />
        <h3 className="wizard__title">{cfg.title}</h3>
      </div>

      {/* Sliding stage body */}
      <div className="wizard__body">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stage}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {stage === 1 && (
              <Stage1
                primaryName={primaryName} setPrimaryName={setPrimaryName}
                partners={partners} setPartners={setPartners}
              />
            )}
            {stage === 2 && (
              <OptionGrid
                options={DRINK_OPTIONS}
                selected={drinkPrefs}
                onToggle={id => toggle(drinkPrefs, setDrinkPrefs, id)}
              />
            )}
            {stage === 3 && (
              <OptionGrid
                options={ACTIVITY_OPTIONS}
                selected={activityPrefs}
                onToggle={id => toggle(activityPrefs, setActivityPrefs, id)}
              />
            )}
            {stage === 4 && (
              <Stage4
                arrivalTime={arrivalTime} setArrivalTime={setArrivalTime}
                additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo}
              />
            )}
            {stage === 5 && (
              <Stage5 reviewItems={reviewItems} visibleReview={visibleReview} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="wizard__nav">
        {stage > 1 && (
          <button
            className="wizard__btn wizard__btn--back"
            onClick={goBack}
            disabled={submitting}
          >← Back</button>
        )}
        {stage < 5 ? (
          <button
            className="wizard__btn wizard__btn--next"
            onClick={goNext}
            disabled={!canNext}
          >
            {stage === 4 ? 'Review →' : 'Next →'}
          </button>
        ) : (
          <SubmitButton submitting={submitting} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  )
}
