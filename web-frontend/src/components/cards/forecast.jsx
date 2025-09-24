import { useQuery } from "@apollo/client/react"
import { GET_FORECAST } from "../../schema/queries"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Carousel } from "react-bootstrap"
import { tempToColor, getBackgroundColor } from "../widgets/utils"

const weekdays = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"]

const Forecast = () => {
    const { state } = useLocation()
    const { lat, lon, location } = state || {}

    const { data, loading, error } = useQuery(GET_FORECAST, {
        variables: { lat, lon },
    })

    if (loading) return <p>Ladataan...</p>
    if (error) return <p>Virhe: {error.message}</p>
    if (!data?.forecast) return <p>Ennustetta ei saatavilla.</p>

const groupedByDay = data.forecast.reduce((acc, item) => {
    const dayKey = item.time.split(" ")[0]
    if (!acc[dayKey]) acc[dayKey] = []
    acc[dayKey].push(item)
    return acc
}, {})

    const days = Object.keys(groupedByDay).slice(0, 5)

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="d-flex flex-row justify-content-center align-items-center"
            style={{ height: "80vh" }}
        >
            <div
                className="card shadow-lg p-4"
                style={{
                    border: "solid 1px black",
                    borderRadius: 20,
                    backgroundColor: "white",
                    width: "90vw",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mb-3">5 päivän ennuste</h3>
                <h5 className="mb-5">{location.split(',')[0]}</h5>

                <Carousel 
                    interval={null} 
                    data-bs-theme="dark"
                    className="position-relative"
                >
                    {days.map((dayKey) => {
                        const items = groupedByDay[dayKey]
                        return (
                            <Carousel.Item key={dayKey}>
                                <div className="d-flex justify-content-between mb-3">
                                    {items.map((f, i) => (
                                        <div key={i} className="text-center" style={{ width: `${100 / items.length}%` }}>
                                            <strong style={{color: tempToColor(f.temp)}}>{Math.round(f.temp)}°C</strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    {items.map((f, i) => (
                                        <div key={i} className="text-center" style={{ width: `${100 / items.length}%` }}>
                                            <img
                                                src={`https://openweathermap.org/img/wn/${f.icon}@2x.png`}
                                                alt={f.description}
                                                style={{ width: 80, height: 80, backgroundColor: getBackgroundColor(f.icon.split('.png')[0]), borderRadius: '50%' }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    {items.map((f, i) => (
                                        <div key={i} className="text-center" style={{ width: `${100 / items.length}%` }}>
                                            {f.description.charAt(0).toUpperCase() + f.description.slice(1)}
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex justify-content-between mb-5">
                                    {items.map((f, i) => (
                                        <div key={i} className="text-center" style={{ width: `${100 / items.length}%`, fontWeight: 'bold' }}>
                                            {new Date(f.time).getHours().toString().padStart(2, "0")}:00
                                        </div>
                                    ))}
                                </div>

                                <h5>
                                    {weekdays[new Date(items[0].time).getDay()]}{" "}
                                    {new Date(items[0].time).toLocaleDateString("fi-FI")}
                                </h5>
                            </Carousel.Item>
                        )
                    })}
                </Carousel>
            </div>
        </motion.div>
    )
}

export default Forecast
