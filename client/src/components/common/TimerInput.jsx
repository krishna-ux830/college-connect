"use client"

import { useState } from "react"

const TimerInput = ({ value, onChange }) => {
  const [enabled, setEnabled] = useState(value?.enabled || false)
  const [duration, setDuration] = useState(value?.duration || 1)

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    onChange({
      enabled: newEnabled,
      duration: newEnabled ? duration : 1,
    })
  }

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value)
    setDuration(newDuration)
    onChange({
      enabled,
      duration: newDuration,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label className="text-sm text-text-secondary">Set Timer</label>
        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="30"
            value={duration}
            onChange={handleDurationChange}
            className="w-20 px-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-text-secondary">days</span>
        </div>
      )}
    </div>
  )
}

export default TimerInput 