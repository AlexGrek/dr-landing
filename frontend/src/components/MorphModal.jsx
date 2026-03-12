import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Modal that expands from the trigger button's position.
 * Usage: capture originRect via e.currentTarget.getBoundingClientRect() on click,
 * pass it along with open/onClose.
 */
export default function MorphModal({ open, originRect, onClose, children }) {
  if (typeof document === 'undefined') return null

  const isMobile = window.innerWidth < 600
  const modalW = isMobile ? window.innerWidth - 16 : Math.min(540, window.innerWidth - 32)
  const modalH = isMobile ? window.innerHeight - 48 : Math.min(600, window.innerHeight * 0.9)

  return createPortal(
    <AnimatePresence>
      {open && originRect && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />

          <motion.div
            className="modal"
            initial={{
              top: originRect.top,
              left: originRect.left,
              width: originRect.width,
              height: originRect.height,
              borderRadius: 9999,
              x: 0,
              y: 0,
            }}
            animate={{
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              width: modalW,
              height: modalH,
              borderRadius: isMobile ? 28 : 24,
            }}
            exit={{
              top: originRect.top,
              left: originRect.left,
              x: 0,
              y: 0,
              width: originRect.width,
              height: originRect.height,
              borderRadius: 9999,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 26,
              mass: 1.1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="modal__inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.28, duration: 0.22 }}
            >
              <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
