import ClockSettings from "../settings/ClockSettings"
import ElectricitySettings from "../settings/ElectricitySettings"
import { useSettings } from "../../contexts/SettingsContext"
import { motion } from "framer-motion"

const Settings = () => {
    const { mainSettings, updateMainSettings } = useSettings()

    const toggle = (field) => {
    const newState = { ...mainSettings, [field]: !mainSettings[field] }
        updateMainSettings(newState)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="d-flex justify-content-center align-items-start"
            style={{ height: '100%' }}
            >
            <div
                className="card shadow-lg d-flex flex-column"
                style={{
                border: '1px solid black',
                borderRadius: 20,
                backgroundColor: 'white',
                width: '70%',
                maxHeight: '100%',
                }}
            >
                <div className="card-body overflow-auto">
                <h2 className="mb-5">Asetukset</h2>

{/* SIVUPANEELI ON/OFF */}                
                <div className="d-flex flex-column align-items-center">
                    <div className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
                        <label className="form-check-label mb-0" htmlFor="showSidepanelSwitch"><h4>Näytä sivupalkki</h4></label>
                            <input
                            className="form-check-input"
                            id="showSidepanelSwitch"
                            type="checkbox"
                            checked={mainSettings.showRightPanel}
                            onChange={() => toggle('showRightPanel')}
                            />
                    </div>

{/* KELLON ASETUKSET */}                
                    <ClockSettings />

{/* SÄÄTIEDOT ON/OFF */}
                    {mainSettings.showRightPanel && (
                    <div className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
                    <h5 className="form-check-label mb-0">Näytä säätiedot</h5>
                        <input
                            className="form-check-input"
                            id="showWeatherSwitch"
                            type="checkbox"
                            checked={mainSettings.showWeather}
                            onChange={() => toggle('showWeather')}
                        />
                    </div>
                    )}

{/* SÄHKÖN HINTATIEDOT */}
                    <ElectricitySettings />
                </div>
            </div>
        </div>
        </motion.div>
    )   
}
export default Settings