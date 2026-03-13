import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Wine, Music, Shirt, Clock, CheckCircle2, ScrollText } from 'lucide-react'
import DRINK_OPTIONS from '../config/drinkOptions.json'
import ACTIVITY_OPTIONS from '../config/activityOptions.json'
import DRESS_CODE_OPTIONS from '../config/dressCodeOptions.json'

const MAX_GUESTS = 8

const RULES_TEXT = `1. Your ticket is personal and non-transferable. Each QR code admits the guests listed on it only.

2. Arrival window is 15:00 – 19:00. Doors close at 20:00. If you're running late, please let us know in the notes.

3. The venue has a maximum capacity. If you registered for a time slot, please try to arrive within 30 minutes of your chosen time.

4. Dress code is a recommendation, not a requirement — but we hope you'll join the fun.

5. Photos and videos are welcome for personal use. Please ask before posting anything that features other guests.

6. Alcohol is for guests 18+. Know your limits and look after each other.

7. The hosts reserve the right to ask anyone who is being disrespectful or disruptive to leave.

8. Food and drink preferences are used for planning only — we can't guarantee every option will be available.

9. If you need to cancel after registering, please do so at least 24 hours in advance so we can adjust the headcount.

10. Most importantly: come ready to have a great time. 🎉`

const STAGES = [
  { Icon: Users, title: "Who's coming?",        accent: '#d9af5d' },
  { Icon: Wine, title: 'Food & Drinks',         accent: '#5dc4d9' },
  { Icon: Music, title: 'Preferred Activities', accent: '#b05dd9' },
  { Icon: Shirt, title: 'Preferred Dress Code', accent: '#e8a87c' },
  { Icon: Clock, title: 'Arrival',              accent: '#e07a5f' },
  { Icon: ScrollText, title: 'Rules & Conditions', accent: '#8fd9a8' },
  { Icon: CheckCircle2, title: 'Almost there!', accent: '#cede48' },
]

const ARRIVAL_TIMES = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00']

const slide = {
  enter: (dir) => ({ x: dir * 56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -56, opacity: 0 }),
}

// ── Stage 1: Rules & Conditions ───────────────────────────────────────────────
function StageRules() {
  return (
    <div className="wizard__stage-body">
      <textarea
        className="wizard__rules-text"
        readOnly
        value={RULES_TEXT}
      />
    </div>
  )
}

// ── Stage 2: Names ────────────────────────────────────────────────────────────
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
        </button>
      )}
    </div>
  )
}

// ── Stage 2, 3, 4: Option checkboxes ──────────────────────────────────────────
function OptionGrid({ options, selected, onToggle }) {
  return (
    <div className="wizard__options-wrap">
      <span className="wizard__select-hint">select multiple</span>
      <div className="wizard__options">
        {options.map(opt => {
          const on = selected.includes(opt)
          return (
            <div
              key={opt}
              className={`wizard__option${on ? ' wizard__option--selected' : ''}`}
              onClick={() => onToggle(opt)}
            >
              <span className="wizard__option-label">{opt}</span>
              <div className="wizard__checkbox">
                {on && <span className="wizard__check-mark">✓</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Stage 5: Arrival time + textarea ──────────────────────────────────────────
function Stage5Arrival({ arrivalTime, setArrivalTime, additionalInfo, setAdditionalInfo }) {
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
        placeholder={arrivalTime !== '15:00' ? 'Explain why you are late…' : 'Allergies, special requests, surprise ideas…'}
        value={additionalInfo}
        onChange={e => setAdditionalInfo(e.target.value)}
        rows={3}
      />
    </div>
  )
}

// ── Stage 6: Review ───────────────────────────────────────────────────────────
function Stage6Review({ reviewItems, visibleReview }) {
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
              transition={{ duration: 1.1, ease: 'easeInOut' }}
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
  const [dressCodePrefs, setDressCodePrefs] = useState([])
  const [arrivalTime, setArrivalTime] = useState('15:00')
  const [additionalInfo, setAdditionalInfo] = useState('')

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const reviewItems = [
    {
      label: 'Name',
      value: [primaryName, ...partners].filter(Boolean).join(', ') || '—',
    },
    {
      label: 'Food & Drinks',
      value: drinkPrefs.length ? drinkPrefs.join(', ') : 'No preference',
    },
    {
      label: 'Preferred Activities',
      value: activityPrefs.length ? activityPrefs.join(', ') : 'No preference',
    },
    {
      label: 'Preferred Dress Code',
      value: dressCodePrefs.length ? dressCodePrefs.join(', ') : 'No preference',
    },
    { label: 'Arrival time', value: arrivalTime },
    ...(additionalInfo.trim()
      ? [{ label: 'Additional info', value: additionalInfo }]
      : []),
  ]

  useEffect(() => {
    if (stage !== 7) return
    const timers = reviewItems.map((_, i) =>
      setTimeout(() => setVisibleReview(prev => [...prev, i]), i * 700)
    )
    return () => timers.forEach(clearTimeout)
  }, [stage])

  const goNext = () => { setDirection(1); setStage(s => s + 1) }
  const goBack = () => {
    if (stage === 7) setVisibleReview([])
    setDirection(-1)
    setStage(s => s - 1)
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const body = {
        name: [primaryName.trim(), ...partners.map(n => n.trim()).filter(Boolean)].join(', '),
        arrival_time: arrivalTime,
        drink_prefs: JSON.stringify(drinkPrefs),
        activity_prefs: JSON.stringify(activityPrefs),
        dress_code_prefs: JSON.stringify(dressCodePrefs),
        additional_info: additionalInfo,
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
                onToggle={val => toggle(drinkPrefs, setDrinkPrefs, val)}
              />
            )}
            {stage === 3 && (
              <OptionGrid
                options={ACTIVITY_OPTIONS}
                selected={activityPrefs}
                onToggle={val => toggle(activityPrefs, setActivityPrefs, val)}
              />
            )}
            {stage === 4 && (
              <OptionGrid
                options={DRESS_CODE_OPTIONS}
                selected={dressCodePrefs}
                onToggle={val => toggle(dressCodePrefs, setDressCodePrefs, val)}
              />
            )}
            {stage === 5 && (
              <Stage5Arrival
                arrivalTime={arrivalTime} setArrivalTime={setArrivalTime}
                additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo}
              />
            )}
            {stage === 6 && <StageRules />}
            {stage === 7 && (
              <Stage6Review reviewItems={reviewItems} visibleReview={visibleReview} />
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
        {stage < 7 ? (
          <button
            className="wizard__btn wizard__btn--next"
            onClick={goNext}
            disabled={!canNext}
          >
            {stage === 6 ? 'Agree →' : 'Next →'}
          </button>
        ) : (
          <SubmitButton submitting={submitting} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  )
}
