import { useQuery } from "@apollo/client/react"
import { GET_WEATHER } from "../../schema/queries"
import { useWeatherSettings } from "../../contexts/WeatherContext"

export const WeatherWidget = () => {
  const { data, loading, error } = useQuery(GET_WEATHER, { variables: { city: 'Heinola,fi' } })
  const { settings } = useWeatherSettings()

  if (loading) return <span>Ladataan...</span>
  if (error) return <span>Virhe haettaessa säätä</span>

  const temp = Math.round(data.weather.temp) + '°C'
  const feels_like = 'Tuntuu kuin ' + Math.round(data.weather.feels_like) + '°C'
  const description = data.weather.description
  const wind = 'Tuuli: ' + data.weather.wind_speed + ' m/s'
  const highest = 'Ylin ' + Math.round(data.weather.temp_max) + '°C'
  const lowest = 'Alin ' + Math.round(data.weather.temp_min) + '°C'
  const visibility = 'Näkyvyys: ' + (data.weather.visibility / 1000).toFixed(1) + ' km'
  const clouds = 'Pilvisyys: ' + data.weather.clouds + '%'
  const location = data.weather.city
  const icon = data.weather.icon

  return (
    <>
      {settings.show &&
        <>
          <h6>Sää</h6>
          <h5 className="card-title">{location}</h5>
          <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={description} style={{ width: "100px" }} />
          <h5 className="card-text">{temp}</h5>
          <div>
            {settings.description && <p className="text-capitalize">{description}</p>}
            {settings.feels_like && <p>{feels_like}</p>}
            {settings.highest && <p>{highest}</p>}
            {settings.lowest && <p>{lowest}</p>}
            {settings.wind && <p>{wind}</p>}
            {settings.visibility && <p>{visibility}</p>}
            {settings.clouds && <p>{clouds}</p>}
          </div>
        </>
      }
    </>
  )
}