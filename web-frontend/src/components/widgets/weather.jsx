import { useQuery } from "@apollo/client/react"
import { GET_WEATHER } from "../../schema/queries"
import { useNavigate } from "react-router-dom"
import { useSettings } from "../../contexts/SettingsContext"
import { useGeolocation } from "../getLocation"
import { tempToColor, getBackgroundColor } from "./utils"

export const WeatherWidget = () => {
  const coords = useGeolocation()
  const { data, loading, error } = useQuery(GET_WEATHER, {
    variables: coords ? { lat: coords.latitude, lon: coords.longitude, city: coords.city } : undefined,
    skip: !coords
  })

  const navigate = useNavigate()
  const { mainSettings } = useSettings()

  if (loading) return <p>Ladataan...</p>
  if (error) return <p>Virhe: {error.message}</p>
  if (!data || !data.weather) return <p>Ei säätietoja saatavilla.</p>

  const tempValue = Math.round(data.weather.temp)
  const temp = tempValue + '°C'
  const feels_like = 'Tuntuu kuin ' + Math.round(data.weather.feels_like) + '°C'
  const weatherDescription = data.weather.description
  const description = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)
  const wind = 'Tuuli: ' + data.weather.wind_speed + ' m/s'
  const visibility =
    'Näkyvyys: ' +
    (data.weather.visibility > 1000
      ? (Math.round(data.weather.visibility / 500) / 2) + ' km'
      : data.weather.visibility.toFixed(0) + ' m')
  const clouds = 'Pilvisyys: ' + data.weather.clouds + '%'
  const location = data.weather.location
  const icon = data.weather.icon

  const additionalWeatherInfo = () => {
    const weatherData = [
      description,
      feels_like,
      wind,
      visibility,
      clouds
    ]

    navigate('/weatherinfo', { state: weatherData })
  }

  return (
    <div className="weather-widget border-bottom">
      <h5 className="mb-1">Sää</h5>
      <h6 className="card-title mb-0">{location}</h6>
      <div className="col d-flex flex-row align-items-center justify-content-center">
        <h5 className="card-text" style={{ color: tempToColor(tempValue), fontSize: '2rem' }}>
          {temp}
        </h5>
        {mainSettings.weatherIcon && (
        <img
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
          alt={description}
          className="mb-0 ms-4"
          style={{ maxWidth: '40%', height: 'auto', borderRadius: '50%', backgroundColor: getBackgroundColor(icon.split('.png')[0]) }}
        />
      )}
      </div>
      <div className="weather-buttons w-100 d-flex justify-content-center flex-wrap gap-2 mb-3">
        <button className="btn btn-primary flex-grow-1" onClick={additionalWeatherInfo}>
          Lisätiedot
        </button>
        <button
          className="btn btn-primary flex-grow-1"
          onClick={() =>
            navigate('/forecast', { state: { lat: coords.latitude, lon: coords.longitude, location } })
          }
        >
          5 vrk ennuste
        </button>
      </div>
    </div>
  )
}