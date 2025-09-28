import { useCalendarSettings } from "../../../contexts/CalendarContext"
import { useSettings } from "../../../contexts/SettingsContext"

const CalendarSettings = () => {
  const { calendarSettings, updateCalendarSettings } = useCalendarSettings()
  const { mainSettings } = useSettings()

  const toggle = (field) => {
    const newState = { ...calendarSettings, [field]: !calendarSettings[field] }
    updateCalendarSettings(newState)
  }

  const settingsList = [
    { key: 'flagDays', label: 'Liputuspäivät' },
    { key: 'nameDays', label: 'Nimipäivät' },
    { key: 'animation', label: 'Animaatiot' }
  ]

  return (
    <>
      {mainSettings.showRightPanel && (
        <div className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
          <h5 className="form-check-label mb-0">Näytä kalenteri sivupaneelissa</h5>
            <input
              className="form-check-input"
              id="showSwitch"
              type="checkbox"
              checked={calendarSettings.show}
              onChange={() => toggle('show')}
            />
        </div>
      )}
      <>
        {settingsList.map(s => (
          <div key={s.key} className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
            <label htmlFor={`${s.key}Switch`} className="form-check-label mb-0 ms-4">{s.label}</label>
              <input
                id={`${s.key}Switch`}
                type="checkbox"
                className="form-check-input"
                checked={calendarSettings[s.key]}
                onChange={() => toggle(s.key)}
              />
          </div>
        ))}
      </>
    </>
  )
}

export default CalendarSettings