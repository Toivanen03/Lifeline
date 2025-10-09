import { WeatherWidget } from "./widgets/weather"
import { useSettings } from "../contexts/SettingsContext"
import { ClockWidget } from "./widgets/clock"
import { ElectricityWidget } from "./widgets/electricity"
import { CalendarWidget } from "./widgets/calendar"

const WidgetPanel = ({ notify, familyMembers }) => {
  const { mainSettings } = useSettings()

  if (!familyMembers || !mainSettings.showRightPanel) {
    return null
  }

  return (
    <div
      className="container bg-light d-flex flex-column"
      style={{ borderLeft: '1px solid #ccc', maxHeight: '90vh', overflowY: 'auto' }}
    >
      <div className="p-0 clock flex-shrink-0">
        <ClockWidget />
      </div>

      {mainSettings.showWeather && (
        <div className="p-0 mt-2 weather flex-shrink-1">
          <WeatherWidget />
        </div>
      )}

      <div className="p-0 mt-2 me-1 electricity flex-grow-1">
        <ElectricityWidget notify={notify} familyMembers={familyMembers} />
      </div>

      <div className="p-0 calendar mb-2 mt-auto flex-shrink-0">
        <CalendarWidget />
      </div>
    </div>
  )
}

export default WidgetPanel