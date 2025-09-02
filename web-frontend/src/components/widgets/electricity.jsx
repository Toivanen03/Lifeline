import { useEffect, useState, useRef, useMemo } from "react"
import { useElectricitySettings } from "../../contexts/ElectricityContext"
import { useQuery } from "@apollo/client/react"
import { GET_CURRENT_PRICE, GET_FUTURE_PRICES } from "../../schema/queries"
import { ElectricityChart } from "../electricityChart"

const CACHE_KEY = "electricityData"
const MAX_AGE = 12 * 60 * 60 * 1000

export const ElectricityWidget = ({ notify }) => {
  const { electricitySettings } = useElectricitySettings()
  const prevPriceRef = useRef(null)

  const initialCache = useMemo(() => {
    const stored = localStorage.getItem(CACHE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Date.now() - parsed.timestamp < MAX_AGE) return parsed.data
    }
    return null
  }, [])

  const [cachedData] = useState(initialCache)

  const { data: nowData, loading: nowLoading, error: nowError } = useQuery(GET_CURRENT_PRICE)
  const { data: futureData, loading: futureLoading, error: futureError } = useQuery(GET_FUTURE_PRICES)

  const current = cachedData ? cachedData.nowData : nowData
  const future = cachedData ? cachedData.futureData : futureData

  const getPriceColorFor = (price) => {
    if (price <= electricitySettings.priceMin) return "green"
    if (price >= electricitySettings.priceMax) return "red"
    return "orange"
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
    if (nowLoading || futureLoading) return
    if (!nowData || !futureData) return

    const currentPrice = nowData.priceNow
    const nextPriceVal = getNextHourPrice(futureData)

    if (prevPriceRef.current === currentPrice) return
    prevPriceRef.current = currentPrice

    if (currentPrice <= electricitySettings.priceMin) {
      notify(
        <div>
          <span>Sähkö on halpaa!</span><br />
          <span style={{ color: getPriceColorFor(currentPrice) }}>{currentPrice} snt/kWh.</span><br />
          <span>Seuraava tunti</span><br />
          <span style={{ color: getPriceColorFor(nextPriceVal) }}>{nextPriceVal} snt/kWh.</span>
        </div>,
        "success"
      )
    } else if (currentPrice >= electricitySettings.priceMax) {
      notify(
        <div>
          <span>Sähkö on kallista!</span><br />
          <span style={{ color: getPriceColorFor(currentPrice) }}>{currentPrice} snt/kWh.</span><br />
          <span>Seuraava tunti</span><br />
          <span style={{ color: getPriceColorFor(nextPriceVal) }}>{nextPriceVal} snt/kWh.</span>
        </div>,
        "error"
      )
    } else {
      notify(
        <div>
          <span>Sähkön hinta nyt:</span><br />
          <span style={{ color: getPriceColorFor(currentPrice) }}>{currentPrice} snt/kWh.</span><br />
          <span>Seuraava tunti</span><br />
          <span style={{ color: getPriceColorFor(nextPriceVal) }}>{nextPriceVal} snt/kWh.</span>
        </div>,
        "info"
      )
    }
  }, [nowData, futureData, electricitySettings, nowLoading, futureLoading, notify])

  const nextPrice = future ? getNextHourPrice(future) : null

  if (!cachedData && (nowLoading || futureLoading)) {
    return <span>Ladataan...</span>
  }

  if (!cachedData && (nowError || futureError)) {
    return <span>Virhe haettaessa hintaa</span>
  }

  return (
    <div style={electricitySettings.show ? { borderBottom: '1px solid #ccc' } : {}}>
      {electricitySettings.show && current && (
        <div>
          <h5>Sähkön hinta nyt:</h5>
          <span style={{ color: getPriceColorFor(current.priceNow) }}>{current.priceNow.toFixed(2)} snt/kWh</span><br />
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
              className="btn btn-primary p-1"
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