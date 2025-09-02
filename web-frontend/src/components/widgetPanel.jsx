import { WeatherWidget } from "./widgets/weather"
import { useSettings } from "../contexts/SettingsContext"
import { ClockWidget } from "./widgets/clock"
import { ElectricityWidget } from "./widgets/electricity"

const WidgetPanel = ({ family, notify }) => {
  const { mainSettings } = useSettings()

  if (!family || !mainSettings.showRightPanel) {
    return null
  }

  return (
    <div className="container bg-light h-100" style={{ borderLeft: '1px solid #ccc' }}>

      <div className="p-2">
        <ClockWidget />
      </div>

      <div className="p-2 mt-2">
        {mainSettings.showWeather &&
          <WeatherWidget />}
      </div>

      <div className="p-2 mt-2">
        <ElectricityWidget notify={notify} />
      </div>

    </div>
  )
}

export default WidgetPanel