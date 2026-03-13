import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DRINK_OPTIONS from '../config/drinkOptions.json'
import ACTIVITY_OPTIONS from '../config/activityOptions.json'
import DRESS_CODE_OPTIONS from '../config/dressCodeOptions.json'

const ARRIVAL_TIMES = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00']

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

function ArrivalEditor({ arrivalTime, setArrivalTime, additionalInfo, setAdditionalInfo }) {
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

const SECTION_META = {
  drinks:    { title: 'Food & Drinks' },
  dress_code: { title: 'Dress Code' },
  activities: { title: 'Activities' },
  arrival:   { title: 'Arrival & Notes' },
}

export default function EditPrefsModal({ section, registration, onSave, onClose }) {
  const parse = (json) => { try { return JSON.parse(json) } catch { return [] } }

  const [drinkPrefs,     setDrinkPrefs]     = useState(parse(registration.drink_prefs))
  const [dressCodePrefs, setDressCodePrefs] = useState(parse(registration.dress_code_prefs))
  const [activityPrefs,  setActivityPrefs]  = useState(parse(registration.activity_prefs))
  const [arrivalTime,    setArrivalTime]    = useState(registration.arrival_time || '15:00')
  const [additionalInfo, setAdditionalInfo] = useState(registration.additional_info || '')
  const [saving, setSaving] = useState(false)

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = {
        drink_prefs:      JSON.stringify(drinkPrefs),
        dress_code_prefs: JSON.stringify(dressCodePrefs),
        activity_prefs:   JSON.stringify(activityPrefs),
        arrival_time:     arrivalTime,
        additional_info:  additionalInfo,
      }
      const res = await fetch(`/api/register/${registration.invitation_code}/prefs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated = await res.json()
        onSave(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="edit-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="edit-modal"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
        >
          <div className="edit-modal__header">
            <h3 className="edit-modal__title">{SECTION_META[section].title}</h3>
            <button className="edit-modal__close" onClick={onClose}>✕</button>
          </div>

          <div className="edit-modal__body">
            {section === 'drinks' && (
              <OptionGrid
                options={DRINK_OPTIONS}
                selected={drinkPrefs}
                onToggle={val => toggle(drinkPrefs, setDrinkPrefs, val)}
              />
            )}
            {section === 'dress_code' && (
              <OptionGrid
                options={DRESS_CODE_OPTIONS}
                selected={dressCodePrefs}
                onToggle={val => toggle(dressCodePrefs, setDressCodePrefs, val)}
              />
            )}
            {section === 'activities' && (
              <OptionGrid
                options={ACTIVITY_OPTIONS}
                selected={activityPrefs}
                onToggle={val => toggle(activityPrefs, setActivityPrefs, val)}
              />
            )}
            {section === 'arrival' && (
              <ArrivalEditor
                arrivalTime={arrivalTime}
                setArrivalTime={setArrivalTime}
                additionalInfo={additionalInfo}
                setAdditionalInfo={setAdditionalInfo}
              />
            )}
          </div>

          <div className="edit-modal__footer">
            <button className="edit-modal__cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="edit-modal__save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
