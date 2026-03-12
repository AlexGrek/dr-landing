import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import { Card, CardBody } from '@heroui/react'
import ScrollReveal from './components/ScrollReveal'
import MorphModal from './components/MorphModal'
import RegisterWizard from './components/RegisterWizard'
import VerifyRegistration from './components/VerifyRegistration'
import AdminPanel from './components/AdminPanel'

function ProgressBar() {
  const { scrollYProgress } = useScroll()
  return <motion.div className="progress-bar" style={{ scaleX: scrollYProgress }} />
}

// ── 1. HERO ──────────────────────────────────────────────────────────────────
function HeroSection() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.13], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.13], [0, -50])

  return (
    <motion.section className="hero" style={{ opacity }}>
      <motion.div className="hero__content" style={{ y }}>
        <motion.p
          className="hero__eyebrow"
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          animate={{ opacity: 1, letterSpacing: '0.55em' }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          You are invited
        </motion.p>
        <motion.h1
          className="hero__title"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          Birthday Party 3.0
        </motion.h1>
      </motion.div>

      <motion.div
        className="hero__scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          ↓
        </motion.span>
        <span className="hero__scroll-text">Scroll</span>
      </motion.div>
    </motion.section>
  )
}

// ── 2. DATE / CALENDAR ───────────────────────────────────────────────────────
function DateSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.35 })
  const [currentDay, setCurrentDay] = useState(16)
  const [animDone, setAnimDone] = useState(false)

  useEffect(() => {
    if (!isInView || animDone) return
    const delays = [500, 440, 340, 240, 170, 110]
    let cancelled = false

    const animate = (step) => {
      if (step >= delays.length || cancelled) {
        if (!cancelled) setAnimDone(true)
        return
      }
      setTimeout(() => {
        if (cancelled) return
        setCurrentDay(17 + step)
        animate(step + 1)
      }, delays[step])
    }

    const init = setTimeout(() => animate(0), 700)
    return () => {
      cancelled = true
      clearTimeout(init)
    }
  }, [isInView])

  // March 2026: March 1 = Sunday → Mon-first offset = 6
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const startOffset = 6
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <section className="date-section" ref={sectionRef}>
      <ScrollReveal>
        <h2 className="section-title">Save the Date</h2>
      </ScrollReveal>
      <ScrollReveal delay={0.15}>
        <div className="calendar">
          <div className="calendar__month">March 2026</div>

          <div className="calendar__weekdays">
            {weekdays.map((d) => (
              <span key={d} className="calendar__weekday">
                {d}
              </span>
            ))}
          </div>

          <div className="calendar__grid">
            {Array.from({ length: startOffset }, (_, i) => (
              <div key={`empty-${i}`} className="calendar__day calendar__day--empty" />
            ))}
            {days.map((day) => {
              const isActive = day === currentDay
              const isFinal = day === 22 && animDone
              const isDim = !animDone && (day < 16 || day > 22)
              return (
                <motion.div
                  key={day}
                  className={[
                    'calendar__day',
                    isActive ? 'calendar__day--active' : '',
                    isFinal ? 'calendar__day--final' : '',
                    isDim ? 'calendar__day--dim' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  animate={isActive ? { scale: 1.3 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                >
                  {day}
                </motion.div>
              )
            })}
          </div>

          <AnimatePresence>
            {animDone && (
              <motion.div
                className="calendar__final-date"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                22 March 2026
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollReveal>
    </section>
  )
}

// ── 3. COUNTDOWN ─────────────────────────────────────────────────────────────
function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const target = new Date('2026-03-22T15:00:00')
    const update = () => {
      const diff = target - new Date()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const entries = [
    { label: 'Days', val: timeLeft.days },
    { label: 'Hours', val: timeLeft.hours },
    { label: 'Mins', val: timeLeft.mins },
    { label: 'Secs', val: timeLeft.secs },
  ]

  return (
    <section className="countdown">
      <ScrollReveal>
        <h2 className="section-title">Time Until the Party</h2>
      </ScrollReveal>
      <div className="countdown__grid">
        {entries.map(({ label, val }, i) => (
          <ScrollReveal key={label} delay={i * 0.08}>
            <div className="countdown__item">
              <motion.span
                className="countdown__number"
                key={val}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {String(val).padStart(2, '0')}
              </motion.span>
              <span className="countdown__label">{label}</span>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal delay={0.35}>
        <p className="countdown__start">
          Party starts at <strong>15:00</strong>
        </p>
      </ScrollReveal>
    </section>
  )
}

// ── 4. LOCATION (Wabi Sabi — Japanese theme) ─────────────────────────────────
function LocationSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // Three layers at different speeds — fast bg, medium kanji, slow text
  const yBg     = useTransform(scrollYProgress, [0, 1], ['-45%', '45%'])
  const yKanji  = useTransform(scrollYProgress, [0, 1], ['-28%', '28%'])
  const yText   = useTransform(scrollYProgress, [0, 1], ['-14%', '14%'])
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 0.18, 0.18, 0])

  return (
    <section className="location" ref={ref}>
      {/* Fast-moving background stripe layer */}
      <motion.div className="location__bg-layer" style={{ y: yBg }} />

      {/* window vignette overlay */}
      <div className="location__vignette" />

      {/* Kanji — moves faster than text, creates depth */}
      <motion.div className="location__kanji-layer" style={{ y: yKanji, opacity }}>
        場所
      </motion.div>

      {/* Main content — slowest layer, feels closest to viewer */}
      <motion.div className="location__parallax" style={{ y: yText }}>
        <div className="location__inner">
          <h2 className="location__name">Wabi Sabi Space</h2>
          <div className="location__rule" />
          <p className="location__address">
            Kyiv, Livy Bereg<br />Zhk Slavutych 2.0<br />вул. Зарічна, 6
          </p>
          <p className="location__date">22 March · 15:00</p>
          <a
            className="location__maps-btn"
            href="https://www.google.com/maps/search/вул.+Зарічна+6+Київ"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="location__maps-icon">⛩</span>
            <span>Open on Google Maps</span>
          </a>
        </div>
      </motion.div>
    </section>
  )
}

// ── 5. REGISTER ───────────────────────────────────────────────────────────────
const MAX_GUESTS = 8

function RegisterForm({ onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [primaryName, setPrimaryName] = useState('')
  const [partners, setPartners] = useState([])

  const allNames = [primaryName, ...partners]
  const canAddPartner = allNames.length < MAX_GUESTS
  const isFilled = primaryName.trim() !== ''

  const addPartner = () => {
    if (canAddPartner) setPartners((p) => [...p, ''])
  }

  const updatePartner = (i, val) =>
    setPartners((p) => p.map((v, idx) => (idx === i ? val : v)))

  const removePartner = (i) =>
    setPartners((p) => p.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!isFilled || submitting) return
    setSubmitting(true)
    try {
      const body = {
        name: primaryName.trim(),
        invitation_code: crypto.randomUUID(),
        additional_info: partners.length
          ? JSON.stringify(partners.filter((n) => n.trim()))
          : '',
      }
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="tickets__form">
      <div className="tickets__field">
        <input
          className="tickets__input"
          type="text"
          placeholder="Your name"
          value={primaryName}
          onChange={(e) => setPrimaryName(e.target.value)}
          autoComplete="name"
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
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="tickets__partner-row">
              <input
                className="tickets__input"
                type="text"
                placeholder={`Partner ${i + 1}`}
                value={val}
                onChange={(e) => updatePartner(i, e.target.value)}
                autoComplete="off"
              />
              <button
                className="tickets__remove-btn"
                onClick={() => removePartner(i)}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {canAddPartner && (
        <button className="tickets__add-partner" onClick={addPartner}>
          + Add partner
          <span className="tickets__add-count">
            {allNames.length}/{MAX_GUESTS}
          </span>
        </button>
      )}

      <div className="tickets__btn-wrap">
        <button
          className="register-btn"
          disabled={submitting || !isFilled}
          onClick={handleSubmit}
        >
          {submitting ? 'Sending…' : 'Register Now'}
        </button>
      </div>
    </div>
  )
}

function RegisterSection({ onOpen, modalOpen }) {
  return (
    <section className="tickets" id="register">
      <ScrollReveal>
        <h2 className="section-title">Register Now</h2>
      </ScrollReveal>
      <ScrollReveal delay={0.15}>
        <div
          className="tickets__btn-wrap"
          style={{ opacity: modalOpen ? 0 : 1, transition: 'opacity 0.15s' }}
        >
          <button className="register-btn" onClick={onOpen}>
            Register Now
          </button>
        </div>
      </ScrollReveal>
    </section>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [originRect, setOriginRect] = useState(null)
  const [registered, setRegistered] = useState(false)

  // Check if we're on a special route
  const pathname = window.location.pathname
  const verifyMatch = pathname.match(/^\/verify\/([a-zA-Z0-9-]+)$/)

  if (verifyMatch) {
    const code = verifyMatch[1]
    return <VerifyRegistration code={code} />
  }

  if (pathname === '/birthday_is_for_me') {
    return <AdminPanel />
  }

  const openModal = (e) => {
    setOriginRect(e.currentTarget.getBoundingClientRect())
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setRegistered(false)
  }

  return (
    <div className="app">
      <ProgressBar />

      {/* Floating CTA */}
      <div className="register-fixed" style={{ opacity: modalOpen ? 0 : 1, transition: 'opacity 0.15s' }}>
        <button className="register-btn" onClick={openModal}>
          Register Now
        </button>
      </div>

      <HeroSection />
      <DateSection />
      <CountdownSection />
      <LocationSection />
      <RegisterSection onOpen={openModal} modalOpen={modalOpen} />

      <footer className="footer">
        <ScrollReveal>
          <p>See you there! 🎂</p>
        </ScrollReveal>
      </footer>

      <MorphModal open={modalOpen} originRect={originRect} onClose={closeModal}>
        {registered ? (
          <div className="modal__success">
            <p className="modal__success-icon">🎉</p>
            <h3 className="modal__success-title">You're on the list!</h3>
            <p className="modal__success-sub">See you on March 22 at 15:00</p>
          </div>
        ) : (
          <RegisterWizard onSuccess={() => setRegistered(true)} />
        )}
      </MorphModal>
    </div>
  )
}
