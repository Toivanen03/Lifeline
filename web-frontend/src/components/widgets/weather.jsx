import { useQuery } from "@apollo/client/react"
import { GET_WEATHER } from "../../schema/queries"
import { useNavigate } from "react-router-dom"

export const WeatherWidget = () => {
  const { data, loading, error } = useQuery(GET_WEATHER, { variables: { city: 'Heinola,fi' } })
  const navigate = useNavigate()

  if (loading) return <span>Ladataan...</span>
  if (error) return <span>Virhe haettaessa säätä</span>

  const tempValue = Math.round(data.weather.temp)
  const temp = tempValue + '°C'
  const feels_like = 'Tuntuu kuin ' + Math.round(data.weather.feels_like) + '°C'
  const weatherDescription = data.weather.description
  const description = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)
  const wind = 'Tuuli: ' + data.weather.wind_speed + ' m/s'
  const highest = 'Ylin ' + Math.round(data.weather.temp_max) + '°C'
  const lowest = 'Alin ' + Math.round(data.weather.temp_min) + '°C'
  const visibility = 'Näkyvyys: ' + (data.weather.visibility / 1000).toFixed(1) + ' km'
  const clouds = 'Pilvisyys: ' + data.weather.clouds + '%'
  const location = data.weather.city
  const icon = data.weather.icon

  const tempToColor = (temp) => {
    const steps = [
      { t: -30, color: 'rgb(0,0,255)' },
      { t: -25, color: 'rgb(40,40,225)' },
      { t: -20, color: 'rgb(60,60,255)' },
      { t: -15, color: 'rgb(80,80,255)' },
      { t: -10, color: 'rgb(100,100,255)' },
      { t: -5,  color: 'rgb(120,120,255)' },
      { t: 0,   color: 'rgb(130,130,255)' },
      { t: 5,   color: 'rgb(255,130,130)' },
      { t: 10,  color: 'rgb(255,115,115)' },
      { t: 15,  color: 'rgb(255,100,100)' },
      { t: 20,  color: 'rgb(255, 80, 80)' },
      { t: 25,  color: 'rgb(255,40,40)' },
      { t: 30,  color: 'rgb(255,0,0)' },
    ]

    let nearest = steps[0].color
    let minDiff = Math.abs(temp - steps[0].t)
    for (let i = 1; i < steps.length; i++) {
      const diff = Math.abs(temp - steps[i].t)
      if (diff < minDiff) {
        minDiff = diff
        nearest = steps[i].color
      }
    }
    return nearest
  }

  const additionalWeatherInfo = () => {
    const weatherData = [
      description,
      feels_like,
      highest,
      lowest,
      wind,
      visibility,
      clouds
    ]

    navigate('/weatherinfo', { state: weatherData })
  }

  return (
    <>
      <h6>Sää</h6>
      <h5 className="card-title mb-2">{location}</h5>
      <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={description} style={{ width: "100px", backgroundColor: 'lightblue', borderRadius: '50%' }} className="mb-2" />
      <h5 className="card-text" style={{ color: tempToColor(tempValue) }}>
        {temp}
      </h5>

      <button
        className="btn btn-primary p-1"
        style={{ border: '1px solid black' }}
        onClick={additionalWeatherInfo}>
        Lisätiedot
      </button>
    </>
  )
}