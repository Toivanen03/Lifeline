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

      {(electricitySettings.show && mainSettings.showRightPanel) &&
      <>
        {settingsList.map(s => (
          <div key={s.key} className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
            <label htmlFor={`${s.key}Switch`} className="form-check-label mb-0 ms-4">{s.label}</label>
              <input
                id={`${s.key}Switch`}
                type="checkbox"
                className="form-check-input"
                checked={electricitySettings[s.key]}
                onChange={() => toggle(s.key)}
              />
          </div>
        ))}
        <div className="col-6 d-flex justify-content-between align-items-center">
          <label htmlFor="priceMin" className="col-form-label ms-4">
            Halvan hinnan alaraja
          </label>
          <div className="d-flex align-items-center">
            <input
              id="priceMin"
              type="number"
              className="form-control"
              style={{ width: 70, height: 30  }}
              value={electricitySettings.priceMin}
              onChange={(e) => {
                let val = e.target.value === "" ? 1 : parseFloat(e.target.value)
                if (val < 1) val = 1
                const newMax = val > electricitySettings.priceMax ? val : electricitySettings.priceMax
                updateElectricitySettings({ 
                  ...electricitySettings, 
                  priceMin: val,
                  priceMax: newMax
                })
              }}
            />
            <span className="ms-3">snt / kWh</span>
          </div>
        </div>

        <div className="col-6 d-flex justify-content-between align-items-center">
          <label htmlFor="priceMax" className="col-form-label ms-4">
            Kalliin hinnan alaraja
          </label>
          <div className="d-flex align-items-center">
            <input
              id="priceMax"
              type="number"
              className="form-control"
              style={{ width: 70, height: 30 }}
              value={electricitySettings.priceMax}
              onChange={(e) => {
                let val = e.target.value === "" ? 1 : parseFloat(e.target.value)
                if (val < electricitySettings.priceMin) val = electricitySettings.priceMin
                updateElectricitySettings({ ...electricitySettings, priceMax: val })
              }}
            />
            <span className="ms-3">snt / kWh</span>
          </div>
        </div>
      </>
      }
    </>
  )
}

export default ElectricitySettings