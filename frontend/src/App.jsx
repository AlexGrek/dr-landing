import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button, Card, CardBody, CardHeader, Chip } from '@heroui/react'
import ScrollReveal from './components/ScrollReveal'
import ParallaxSection from './components/ParallaxSection'
import ScrollHint from './components/ScrollHint'

function ProgressBar() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div className="progress-bar" style={{ scaleX: scrollYProgress }} />
  )
}

function HeroSection() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9])

  return (
    <motion.section className="hero" style={{ opacity, scale }}>
      <div className="hero__content">
        <motion.h1
          className="hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          You're Invited
        </motion.h1>
        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          The birthday celebration of the year
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Chip color="secondary" variant="shadow" size="lg">
            Limited Tickets Available
          </Chip>
        </motion.div>
      </div>
      <ScrollHint />
    </motion.section>
  )
}

function DetailsSection() {
  return (
    <section className="details">
      <ScrollReveal>
        <h2 className="section-title">Event Details</h2>
      </ScrollReveal>
      <div className="details__grid">
        <ScrollReveal direction="left" delay={0.1}>
          <Card className="details__card">
            <CardHeader className="details__card-header">
              <span className="details__icon">📅</span>
              <h3>When</h3>
            </CardHeader>
            <CardBody>
              <p>Saturday, April 15th, 2026</p>
              <p>7:00 PM - Late</p>
            </CardBody>
          </Card>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.2}>
          <Card className="details__card">
            <CardHeader className="details__card-header">
              <span className="details__icon">📍</span>
              <h3>Where</h3>
            </CardHeader>
            <CardBody>
              <p>The Grand Ballroom</p>
              <p>123 Celebration Ave</p>
            </CardBody>
          </Card>
        </ScrollReveal>
        <ScrollReveal direction="right" delay={0.3}>
          <Card className="details__card">
            <CardHeader className="details__card-header">
              <span className="details__icon">🎭</span>
              <h3>Theme</h3>
            </CardHeader>
            <CardBody>
              <p>Masquerade Night</p>
              <p>Dress to impress</p>
            </CardBody>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  )
}

function HighlightsSection() {
  const highlights = [
    { title: 'Live DJ', desc: 'Music all night long', icon: '🎵' },
    { title: 'Open Bar', desc: 'Premium cocktails', icon: '🍸' },
    { title: 'Photo Booth', desc: 'Capture the memories', icon: '📸' },
    { title: 'Surprise Acts', desc: "You won't want to miss it", icon: '🎪' },
  ]

  return (
    <ParallaxSection className="highlights" speed={0.2}>
      <ScrollReveal>
        <h2 className="section-title">What Awaits You</h2>
      </ScrollReveal>
      <div className="highlights__grid">
        {highlights.map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 0.15}>
            <motion.div
              className="highlights__item"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="highlights__icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </ParallaxSection>
  )
}

function TicketSection() {
  const [tickets, setTickets] = useState(null)
  const [booking, setBooking] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/tickets/available')
      .then((r) => r.json())
      .then(setTickets)
      .catch(() => {})
  }, [])

  const handleBook = async () => {
    if (!name || !email) return
    setBooking(true)
    try {
      const res = await fetch('/api/tickets/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      if (res.ok) {
        setSuccess(true)
        const updated = await fetch('/api/tickets/available').then((r) => r.json())
        setTickets(updated)
      }
    } finally {
      setBooking(false)
    }
  }

  return (
    <section className="tickets">
      <ScrollReveal>
        <h2 className="section-title">Get Your Ticket</h2>
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <Card className="tickets__card">
          <CardBody>
            {tickets && (
              <div className="tickets__stats">
                <Chip color="success" variant="flat">
                  {tickets.available} available
                </Chip>
                <Chip color="warning" variant="flat">
                  {tickets.sold} sold
                </Chip>
              </div>
            )}
            {success ? (
              <motion.div
                className="tickets__success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="tickets__success-icon">🎉</span>
                <h3>You're in!</h3>
                <p>Check your email for confirmation</p>
              </motion.div>
            ) : (
              <div className="tickets__form">
                <input
                  className="tickets__input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="tickets__input"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  color="secondary"
                  size="lg"
                  variant="shadow"
                  isLoading={booking}
                  onPress={handleBook}
                  isDisabled={!name || !email}
                  className="tickets__button"
                >
                  Reserve My Spot
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </ScrollReveal>
    </section>
  )
}

function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const target = new Date('2026-04-15T19:00:00')
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

  return (
    <ParallaxSection className="countdown" speed={0.15}>
      <ScrollReveal>
        <h2 className="section-title">Countdown</h2>
      </ScrollReveal>
      <div className="countdown__grid">
        {Object.entries(timeLeft).map(([label, val], i) => (
          <ScrollReveal key={label} delay={i * 0.1}>
            <motion.div
              className="countdown__item"
              whileHover={{ rotateY: 10 }}
            >
              <motion.span
                className="countdown__number"
                key={val}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {String(val).padStart(2, '0')}
              </motion.span>
              <span className="countdown__label">{label}</span>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </ParallaxSection>
  )
}

export default function App() {
  return (
    <div className="app">
      <ProgressBar />
      <HeroSection />
      <CountdownSection />
      <DetailsSection />
      <HighlightsSection />
      <TicketSection />
      <footer className="footer">
        <ScrollReveal>
          <p>See you there! 🎂</p>
        </ScrollReveal>
      </footer>
    </div>
  )
}
