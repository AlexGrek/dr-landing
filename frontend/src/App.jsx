import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import ScrollReveal from './components/ScrollReveal'
import MorphModal from './components/MorphModal'

// Lazy-loaded route pages (separate chunks — recharts/js-yaml never loaded on main page)
const VerifyRegistration = lazy(() => import('./components/VerifyRegistration'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))

// Lazy-loaded modal content (only fetched when modal opens)
const RegisterWizard = lazy(() => import('./components/RegisterWizard'))
const TicketConfirmation = lazy(() => import('./components/TicketConfirmation'))

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
        transition={{ delay: 0.8 }}
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
              <AnimatePresence mode="popLayout">
                <motion.span
                  className="countdown__number"
                  key={val}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  {String(val).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
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
            Kyiv, Livy Bereg<br />Zhk Slavutych 2.0<br />вул. Зарічна, 6, корпус 4
          </p>
          <p className="location__date">22 March · 15:00</p>
          <a
            className="location__maps-btn"
            href="https://maps.app.goo.gl/bEvJxmD1Wt1GffAP9"
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

// ── 5. FOOTER TAGLINE ─────────────────────────────────────────────────────────
function FooterTagline({ text }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.6 })
  const chars = text.split('')

  return (
    <p
      className="footer__tagline"
      ref={ref}
      style={isInView ? { animation: 'footer-shimmer 1.8s linear 0.2s 1 forwards' } : {}}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          className={`footer__tagline-letter${ch === ' ' ? ' footer__tagline-letter--space' : ''}`}
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </p>
  )
}

// ── Lazy Rules Text (loaded on demand) ────────────────────────────────────────
const ReactMarkdown = lazy(() => import('react-markdown'))

function LazyRulesText() {
  const [text, setText] = useState('')
  useEffect(() => {
    import('./config/rulesText.js').then(m => setText(m.default))
  }, [])
  return (
    <div className="wizard__rules-text wizard__rules-text--fill">
      <Suspense fallback={null}>
        <ReactMarkdown>{text}</ReactMarkdown>
      </Suspense>
    </div>
  )
}

// ── 6. REGISTER ───────────────────────────────────────────────────────────────
function RegisterSection({ onOpen, modalOpen, sectionRef, onOpenRules }) {
  return (
    <section className="tickets" id="register" ref={sectionRef}>
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
          <button className="tickets__rules-link" onClick={onOpenRules}>
            rules &amp; conditions
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
  const [registrationData, setRegistrationData] = useState(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [rulesOriginRect, setRulesOriginRect] = useState(null)
  const registerSectionRef = useRef(null)
  const registerInView = useInView(registerSectionRef, { amount: 0.2 })

  // Check if we're on a special route
  const pathname = window.location.pathname
  const verifyMatch = pathname.match(/^\/verify\/([a-zA-Z0-9-]+)$/)

  if (verifyMatch) {
    const code = verifyMatch[1]
    return (
      <Suspense fallback={<div className="lazy-loading">Loading…</div>}>
        <VerifyRegistration code={code} />
      </Suspense>
    )
  }

  if (pathname === '/birthday_is_for_me') {
    return (
      <Suspense fallback={<div className="lazy-loading">Loading…</div>}>
        <AdminPanel />
      </Suspense>
    )
  }

  const openModal = (e) => {
    setOriginRect(e.currentTarget.getBoundingClientRect())
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setRegistered(false)
  }

  const openRules = (e) => {
    setRulesOriginRect(e.currentTarget.getBoundingClientRect())
    setRulesOpen(true)
  }

  return (
    <div className="app">
      <ProgressBar />

      {/* Floating CTA */}
      <div className="register-fixed" style={{ opacity: modalOpen || registerInView ? 0 : 1, transition: 'opacity 0.4s' }}>
        <button className="register-btn" onClick={openModal}>
          Register Now
        </button>
      </div>

      <HeroSection />
      <DateSection />
      <CountdownSection />
      <LocationSection />
      <RegisterSection onOpen={openModal} modalOpen={modalOpen} sectionRef={registerSectionRef} onOpenRules={openRules} />

      <footer className="footer">
        <FooterTagline text="See you there" />
      </footer>

      <footer className="footer-contact">
        <div className="footer-contact__row">
          <span className="footer-contact__item">Alex Grek</span>
          <span className="footer-contact__dot">·</span>
          <a className="footer-contact__item" href="tel:+30985081984">+30985081984</a>
          <span className="footer-contact__dot">·</span>
          <a className="footer-contact__item" href="mailto:alexgrek.hq@gmail.com">alexgrek.hq@gmail.com</a>
          <span className="footer-contact__dot">·</span>
          <a className="footer-contact__item footer-contact__item--icon" href="https://github.com/AlexGrek/dr-landing" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </footer>

      <MorphModal
        open={rulesOpen}
        originRect={rulesOriginRect}
        onClose={() => setRulesOpen(false)}
      >
        <LazyRulesText />
      </MorphModal>

      <MorphModal
        open={modalOpen}
        originRect={originRect}
        onClose={closeModal}
        closeOnBackdropClick={!registered}
      >
        <Suspense fallback={<div className="lazy-loading">Loading…</div>}>
          {registered ? (
            <TicketConfirmation data={registrationData} />
          ) : (
            <RegisterWizard onSuccess={(data) => {
              setRegistrationData(data)
              setRegistered(true)
            }} />
          )}
        </Suspense>
      </MorphModal>
    </div>
  )
}
