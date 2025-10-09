import ClockSettings from "../settings/ClockSettings"
import ElectricitySettings from "../settings/ElectricitySettings"
import CalendarSettings from "../settings/CalendarSettings"
import { useCalendarSettings } from "../../contexts/CalendarWidgetContext"
import { useSettings } from "../../contexts/SettingsContext"
import { useClockSettings } from "../../contexts/ClockContext"
import { useElectricitySettings } from "../../contexts/ElectricityContext"
import UserSettings from "../settings/UserSettings"
import { motion } from "framer-motion"
import { useEffect } from "react"

const Settings = ({ notify }) => {
    const { mainSettings, updateMainSettings } = useSettings()
    const { clockSettings } = useClockSettings()
    const { electricitySettings } = useElectricitySettings()
    const { calendarSettings } = useCalendarSettings()

    const toggle = (field) => {
        const newState = { ...mainSettings, [field]: !mainSettings[field] }
        if (field === "showRightPanel" && newState.showRightPanel) {
        const widgetsOn = newState.showWeather || clockSettings.show || electricitySettings.show || calendarSettings.show
        if (!widgetsOn) {
            clockSettings.show = true
        }
    }
        updateMainSettings(newState)
    }

    const settingsList = [
        { key: 'weatherIcon', label: 'Näytä kuvake' },
    ]

    useEffect(() => {
        const widgetsOn = mainSettings.showWeather || clockSettings.show || electricitySettings.show || calendarSettings.show
        if (!widgetsOn && mainSettings.showRightPanel) {
            updateMainSettings({ ...mainSettings, showRightPanel: false })
        }
    }, [mainSettings, clockSettings, electricitySettings, calendarSettings, updateMainSettings])


    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="d-flex justify-content-center align-items-start mt-5"
            >
            <div
                className="card shadow-lg p-2"
                style={{
                border: '1px solid black',
                borderRadius: 20,
                backgroundColor: 'white',
                width: '80%',
                maxHeight: '80vh',
                overflow: 'hidden'
                }}
            >
                <div className="card-body overflow-auto">
                <h2 className="mb-4 d-flex flex-start">Sivupaneelin asetukset</h2>

{/* SIVUPANEELI ON/OFF */}                
                <div className="d-flex flex-column align-items-center">
                    <div className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
                        <label className="form-check-label mb-0" htmlFor="showSidepanelSwitch"><h5>Näytä sivupalkki</h5></label>
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
                    {mainSettings.showRightPanel && mainSettings.showWeather &&(
                    <>
                    {settingsList.map(s => (
                        <div key={s.key} className="col-7 form-check form-switch d-flex justify-content-between align-items-center mb-3">
                            <label htmlFor={`${s.key}Switch`} className="form-check-label mb-0 ms-4">{s.label}</label>
                            <input
                                id={`${s.key}Switch`}
                                type="checkbox"
                                className="form-check-input"
                                checked={mainSettings[s.key]}
                                onChange={() => toggle(s.key)}
                            />
                        </div>
                        ))}
                    </>
                    )}

{/* SÄHKÖN HINTATIEDOT */}
                    <ElectricitySettings />

{/* KALENTERIN ASETUKSET */}
                    <h2 className="mt-3 mb-3 align-self-start">Kalenterin asetukset</h2>
                    <CalendarSettings />
{/* MUUT ASETUKSET */}
                    <h2 className="mt-3 mb-3 align-self-start">Käyttäjätilin asetukset</h2>
                    <UserSettings notify={notify} />
                </div>
            </div>
        </div>
        </motion.div>
    )   
}
export default Settings