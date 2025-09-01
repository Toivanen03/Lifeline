import { WeatherWidget } from "./widgets/weather"
import { useSettings } from "../contexts/SettingsContext"
import { ClockWidget } from "./widgets/clock"
import { ElectricityWidget } from "./widgets/electricity"

const WidgetPanel = ({ family }) => {
  const { mainSettings } = useSettings()

  if (!family || !mainSettings.showRightPanel) {
    return null
  }

  return (
    <div className="bg-light border-start h-100">

      <div className="border-bottom border-dark p-3">
        <ClockWidget />
      </div>

      <div className="border-bottom border-dark p-3">
        {mainSettings.showWeather &&
          <WeatherWidget />}
      </div>

      <div className="border-bottom border-dark p-3">
        <ElectricityWidget />
      </div>

    </div>
  )
}

export default WidgetPanel