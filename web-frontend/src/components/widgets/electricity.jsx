import { useEffect, useState, useRef, useMemo } from "react"
import { useElectricitySettings } from "../../contexts/ElectricityContext"
import { useQuery } from "@apollo/client/react"
import { GET_FUTURE_PRICES, NOTIFICATION_SETTINGS } from "../../schema/queries"
import { ElectricityChart } from "../electricityChart"

const CACHE_KEY = "electricityData"
const MAX_AGE = 24 * 60 * 60 * 1000

const loadCache = () => {
  const stored = localStorage.getItem(CACHE_KEY)
  if (!stored) return null
  const parsed = JSON.parse(stored)
  const cachedDate = new Date(parsed.timestamp).getDate()
  const today = new Date().getDate()

  if (cachedDate !== today || Date.now() - parsed.timestamp > MAX_AGE) return null

  return parsed.data
}

const saveCache = (data) => {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data,
    })
  )
}

export const ElectricityWidget = ({ notify, familyMembers }) => {
  const { data } = useQuery(NOTIFICATION_SETTINGS)
  const { electricitySettings } = useElectricitySettings()
  const prevPriceRef = useRef(null)
  const [tick, setTick] = useState(0)
  const [forceRefresh, setForceRefresh] = useState(false)

  const cached = useMemo(() => loadCache(), [])

  const { data: futureData, loading: futureLoading, error: futureError } = useQuery(GET_FUTURE_PRICES, {
    fetchPolicy: "network-only",
    skip: !!cached && !forceRefresh,
  })

  useEffect(() => {
    if (futureData) saveCache({ futureData })
    setForceRefresh(false)
  }, [futureData])

  const future = cached ? cached.futureData : futureData

  const getPriceColorFor = (price) => {
    if (price <= electricitySettings.priceMin) return "green"
    if (price >= electricitySettings.priceMax) return "red"
    return "orange"
  }

  const getCurrentPrice = (futureDataParam) => {
    if (!futureDataParam?.futurePrices) return null
    const now = new Date()
    const currentObj = futureDataParam.futurePrices.find(p => {
      const pStart = new Date(p.startDate)
      return pStart.getFullYear() === now.getFullYear() &&
             pStart.getMonth() === now.getMonth() &&
             pStart.getDate() === now.getDate() &&
             pStart.getHours() === now.getHours()
    })
    return currentObj?.price ?? null
  }

  const getNextHourPrice = (futureDataParam) => {
    if (!futureDataParam?.futurePrices) return null
    const now = new Date()
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1)
    const nextPriceObj = futureDataParam.futurePrices.find(p => {
      const pStart = new Date(p.startDate)
      return pStart.getFullYear() === nextHour.getFullYear() &&
             pStart.getMonth() === nextHour.getMonth() &&
             pStart.getDate() === nextHour.getDate() &&
             pStart.getHours() === nextHour.getHours()
    })
    return nextPriceObj?.price ?? null
  }

  useEffect(() => {
    if (!future?.futurePrices || !data?.notificationSettings?.electricity) return

    const currentPrice = getCurrentPrice(future)
    const nextPriceVal = getNextHourPrice(future)

    if (prevPriceRef.current === null) {
      prevPriceRef.current = currentPrice
      return
    }

    const electricitySubscriptions = Object.fromEntries(
      data.notificationSettings.electricity.map(e => [e.userId, e.enabled])
    )

    familyMembers.forEach(user => {
      if (!electricitySubscriptions[user.id]) return
      if (prevPriceRef.current === currentPrice) return

      prevPriceRef.current = currentPrice

      if (nextPriceVal !== currentPrice) {
        const colorNow = getPriceColorFor(currentPrice)
        const colorNext = getPriceColorFor(nextPriceVal)

        let type = "info"
        let title = "Sähkön hinta nyt:"
        if (currentPrice <= electricitySettings.priceMin) {
          type = "success"
          title = "Sähkö on halpaa!"
        } else if (currentPrice >= electricitySettings.priceMax) {
          type = "error"
          title = "Sähkö on kallista!"
        }

        notify(
          <div>
            <span>{title}</span>
            <br />
            <span style={{ color: colorNow }}>{currentPrice.toFixed(2)} snt/kWh.</span>
            <br />
            <span>Seuraava tunti</span>
            <br />
            <span style={{ color: colorNext }}>{nextPriceVal.toFixed(2)} snt/kWh.</span>
          </div>,
          type
        )
      }
    })
  }, [future, data, electricitySettings, notify, tick, familyMembers])

  useEffect(() => {
    const updateAtFullHour = () => setTick(t => t + 1)
    const checkForceRefresh = () => {
      const now = new Date()
      if (now.getHours() === 14 && now.getMinutes() >= 5 && !forceRefresh) {
        setForceRefresh(true)
      }
    }

    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds()

    const hourTimeout = setTimeout(() => {
      updateAtFullHour()
      setInterval(updateAtFullHour, 60 * 60 * 1000)
    }, msUntilNextHour)

    const minuteInterval = setInterval(checkForceRefresh, msUntilNextMinute)

    return () => {
      clearTimeout(hourTimeout)
      clearInterval(minuteInterval)
    }
  }, [forceRefresh])

  const currentPrice = future ? getCurrentPrice(future) : null
  const nextPrice = future ? getNextHourPrice(future) : null

  if (!cached && futureLoading) return <span>Ladataan...</span>
  if (!cached && futureError) return <span>Virhe haettaessa hintaa</span>

  return (
    <div style={electricitySettings.show ? { borderBottom: "1px solid #ccc" } : {}}>
      {electricitySettings.show && currentPrice !== null && (
        <div>
          <h5>Sähkön hinta nyt:</h5>
          <span style={{ color: getPriceColorFor(currentPrice) }}>{currentPrice.toFixed(2)} snt/kWh</span><br />
          {nextPrice !== null && electricitySettings.nextHour && (
            <>
              <span className="me-2"><small>Seuraava tunti: </small></span>
              <span style={{ color: getPriceColorFor(nextPrice) }}><small>{nextPrice.toFixed(2)} snt/kWh</small></span>
            </>
          )}
        </div>
      )}

      {electricitySettings.show && electricitySettings.future && future && (
        <div className="d-flex justify-content-center">
          <div style={{ width: "95%", maxWidth: "800px" }}>
            <ElectricityChart prices={future.futurePrices} />
            <button
              className="btn btn-primary p-1 mb-3"
              style={{ border: "1px solid black" }}
              onClick={() => window.open("https://porssisahko.net/tilastot")}
            >
              Hintahistoria
            </button>
          </div>
        </div>
      )}
    </div>
  )
}