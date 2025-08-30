import { motion } from "framer-motion"
import { useWeatherSettings } from "../../contexts/WeatherContext"

const WeatherSettings = () => {
  const { settings, updateSettings } = useWeatherSettings()

  const toggle = (field) => {
    const newState = { ...settings, [field]: !settings[field] }
    updateSettings(newState)
  }

  const settingsList = [
    { key: 'feels_like', label: 'Tuntuu kuin:' },
    { key: 'description', label: 'Kuvaus' },
    { key: 'wind', label: 'Näytä tuuli' },
    { key: 'highest', label: 'Näytä ylin lämpötila' },
    { key: 'lowest', label: 'Näytä alin lämpötila' },
    { key: 'visibility', label: 'Näytä näkyvyys' },
    { key: 'clouds', label: 'Näytä pilvisyys' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: '50vh' }}
    >
      <div className="card shadow-lg p-4" style={{ border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white', width: '70%' }}>
        <h4 className="mb-4">Säätietojen näyttöasetukset:</h4>
        {settings.show ? (
          <div className="row">
            {settingsList.map(s => (
              <div key={s.key} className="col-6 form-check form-switch d-flex justify-content-between align-items-center mb-3">
                <label htmlFor={`${s.key}Switch`} className="form-check-label mb-0">{s.label}</label>
                <input
                  id={`${s.key}Switch`}
                  type="checkbox"
                  className="form-check-input"
                  checked={settings[s.key]}
                  onChange={() => toggle(s.key)}
                />
              </div>
            ))}
            <div className="col-6 form-check form-switch d-flex justify-content-between align-items-center mb-3">
              <label htmlFor="hideSwitch" className="form-check-label mb-0">Piilota säätiedot</label>
              <input
                id="hideSwitch"
                type="checkbox"
                className="form-check-input"
                checked={!settings.show}
                onChange={() => updateSettings({ ...settings, show: false })}
              />
            </div>
          </div>
        ) : (
          <div className="form-check form-switch d-flex justify-content-between align-items-center mb-4">
            <label className="form-check-label mb-0" htmlFor="showSwitch">Näytä säätiedot</label>
            <input
              className="form-check-input"
              id="showSwitch"
              type="checkbox"
              checked={settings.show}
              onChange={() => updateSettings({ ...settings, show: true })}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default WeatherSettings