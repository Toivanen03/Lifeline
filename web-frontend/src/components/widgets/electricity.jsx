import { useElectricitySettings } from "../../contexts/ElectricityContext"
import { useQuery } from '@apollo/client/react'
import { GET_CURRENT_PRICE, GET_FUTURE_PRICES } from "../../schema/queries"
import { ElectricityChart } from "../electricityChart"

export const ElectricityWidget = () => {
  const { electricitySettings } = useElectricitySettings()

  const { data: nowData, loading: nowLoading, error: nowError } = useQuery(GET_CURRENT_PRICE)
  const { data: futureData, loading: futureLoading, error: futureError } = useQuery(GET_FUTURE_PRICES)

  if (nowLoading || futureLoading) return <span>Ladataan...</span>
  if (nowError || futureError) return <span>Virhe haettaessa hintaa</span>

  return (
    <>
        {electricitySettings.show && nowData && (
            <div>
            <h5>Sähkön hinta nyt:</h5>
            {nowData.priceNow.toFixed(2)} snt/kWh
            </div>
        )}

        {electricitySettings.show && electricitySettings.future && futureData && (
        <div className="d-flex justify-content-center">
            <div style={{ width: "95%", maxWidth: "800px" }}>
            <ElectricityChart prices={futureData.futurePrices} />
            <button
                className="btn btn-primary p-1"
                style={{ border: '1px solid black' }}
                onClick={() => window.open("https://porssisahko.net/tilastot")}>
                Hintahistoria
            </button>
            </div>
        </div>
        )}
    </>
  )
}