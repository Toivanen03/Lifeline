import { useState, useEffect } from "react"
import config from "../config/config"

export const useGeolocation = () => {
  const [coords, setCoords] = useState(null)

  const url = config() + '/api/location'

  useEffect(() => {
    const fetchLocationByIP = async (error) => {
      try {
        const res = await fetch(`${url}`)
        const data = await res.json()
        if (data) {
          setCoords({
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
          })
        } else {
          console.error("IP-sijainnin haku epäonnistui", error)
        }
      } catch (err) {
        console.error("IP-sijainnin haku epäonnistui", err)
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: null,
          })
        },
        (error) => {
          console.warn("Haetaan sijainti IP:n perusteella. Brave-selaimella tämä ei ole virhe!", error)
          fetchLocationByIP(error)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        }
      )
    } else {
      fetchLocationByIP()
    }
  }, [])

  return coords
}