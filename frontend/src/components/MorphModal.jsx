import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function MorphModal({ open, originRect, onClose, closeOnBackdropClick = true, children }) {
  if (typeof document === 'undefined') return null

  const [contentReady, setContentReady] = useState(false)

  useEffect(() => {
    if (!open) setContentReady(false)
  }, [open])

  const isMobile = window.innerWidth < 600
  const modalW = isMobile ? window.innerWidth - 16 : Math.min(540, window.innerWidth - 32)
  const modalH = isMobile ? window.innerHeight - 48 : Math.min(600, window.innerHeight * 0.9)
  const finalRadius = isMobile ? 28 : 24

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
            onClick={closeOnBackdropClick ? onClose : undefined}
          />

          <motion.div
            className="modal"
            style={{ transformPerspective: 1400 }}
            initial={{
              top: originRect.top,
              left: originRect.left,
              width: originRect.width,
              height: originRect.height,
              borderRadius: finalRadius,
              x: 0,
              y: 0,
              rotateX: -14,
              scale: 0.92,
            }}
            animate={{
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              width: modalW,
              height: modalH,
              borderRadius: finalRadius,
              rotateX: 0,
              scale: 1,
            }}
            exit={{
              top: originRect.top,
              left: originRect.left,
              x: 0,
              y: 0,
              width: originRect.width,
              height: originRect.height,
              borderRadius: finalRadius,
              rotateX: 10,
              scale: 0.88,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 240,
              damping: 28,
              mass: 1,
              rotateX: { type: 'spring', stiffness: 260, damping: 22 },
              scale: { type: 'spring', stiffness: 260, damping: 22 },
            }}
            onAnimationComplete={() => { if (open) setContentReady(true) }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__inner">
              <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
              {contentReady && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12 }}
                >
                  {children}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
