import { useElectricitySettings } from "../../contexts/ElectricityContext"
import { useSettings } from "../../contexts/SettingsContext"

const ElectricitySettings = () => {
  const { electricitySettings, updateElectricitySettings } = useElectricitySettings()
  const { mainSettings } = useSettings()

  const toggle = (field) => {
    const newState = { ...electricitySettings, [field]: !electricitySettings[field] }
    updateElectricitySettings(newState)
  }

  const settingsList = [
    { key: 'future', label: 'Näytä 24h taulukko' },
    { key: 'nextHour', label: 'Näytä seuraava tunti' }
  ]

  return (
    <>
      {mainSettings.showRightPanel && (
        <div className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
          <h5 className="form-check-label mb-0">Näytä pörssisähkön hinta</h5>
          <input
            className="form-check-input"
            id="showSwitch"
            type="checkbox"
            checked={electricitySettings.show}
            onChange={() => toggle('show')}
          />
        </div>
      )}

      {electricitySettings.show && mainSettings.showRightPanel && (
        <>
          {settingsList.map(s => (
            <div key={s.key} className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
              <label htmlFor={`${s.key}Switch`} className="form-check-label ms-3">{s.label}</label>
              <input
                id={`${s.key}Switch`}
                type="checkbox"
                className="form-check-input"
                checked={electricitySettings[s.key]}
                onChange={() => toggle(s.key)}
              />
            </div>
          ))}
        </>
      )}
    </>
  )
}

export default ElectricitySettings