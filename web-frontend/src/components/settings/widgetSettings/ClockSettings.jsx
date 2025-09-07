import { useClockSettings } from "../../../contexts/ClockContext"
import { useSettings } from "../../../contexts/SettingsContext"

const ClockSettings = () => {
  const { clockSettings, updateClockSettings } = useClockSettings()
  const { mainSettings } = useSettings()

  const toggle = (field) => {
    const newState = { ...clockSettings, [field]: !clockSettings[field] }
    updateClockSettings(newState)
  }

  const settingsList = [
    { key: 'digital', label: 'Analoginen kello' },
  ]

  return (
    <>
      {mainSettings.showRightPanel && (
        <div className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
          <h5 className="form-check-label mb-0">Näytä kello</h5>
            <input
              className="form-check-input"
              id="showSwitch"
              type="checkbox"
              checked={clockSettings.show}
              onChange={() => toggle('show')}
            />
        </div>
      )}

      {(clockSettings.show && mainSettings.showRightPanel) && 
      <>
        {settingsList.map(s => (
          <div key={s.key} className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
            <label htmlFor={`${s.key}Switch`} className="form-check-label mb-0 ms-4">{s.label}</label>
              <input
                id={`${s.key}Switch`}
                type="checkbox"
                className="form-check-input"
                checked={clockSettings[s.key]}
                onChange={() => toggle(s.key)}
              />
          </div>
        ))}
      </>
      }
    </>
  )
}

export default ClockSettings