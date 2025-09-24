import { useState, useEffect } from "react"
import config from "../config/config"

export const useGeolocation = () => {
  const [coords, setCoords] = useState(null)
  const url = config() + "/api/location"

  useEffect(() => {
    const CACHE_KEY = "userCoords"
    const CACHE_TTL = 24 * 60 * 60 * 1000

    const checkCache = () => {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          return parsed.coords
        }
      }
      return null
    }

    const saveCache = (coords) => {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ coords, timestamp: Date.now() })
      )
    }

    const fetchLocationByIP = async (error) => {
      try {
        const res = await fetch(url)
        const data = await res.json()
        if (data) {
          const newCoords = {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
          }
          setCoords(newCoords)
          saveCache(newCoords)
        } else {
          console.error("IP-sijainnin haku epäonnistui", error)
        }
      } catch (err) {
        console.error("IP-sijainnin haku epäonnistui", err)
      }
    }

    const cachedCoords = checkCache()
    if (cachedCoords) {
      setCoords(cachedCoords)
      return
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: null,
          }
          setCoords(newCoords)
          saveCache(newCoords)
        },
        (error) => {
          console.warn(
            "Haetaan sijainti IP:n perusteella. Brave-selaimella tämä ei ole virhe!",
            error
          )
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