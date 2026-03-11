import { motion } from 'framer-motion'

export default function ScrollHint() {
  return (
    <motion.div
      className="scroll-hint"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="scroll-hint__mouse">
        <motion.div
          className="scroll-hint__wheel"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <span className="scroll-hint__text">Scroll to explore</span>
    </motion.div>
  )
}
