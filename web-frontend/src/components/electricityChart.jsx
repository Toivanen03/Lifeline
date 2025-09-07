import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from "recharts"
import { useMemo } from "react"

export const ElectricityChart = ({ prices }) => {
  const chartData = useMemo(() => {
    return prices
      .slice()
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map(p => ({
        iso: new Date(p.startDate).getTime(),
        time: new Date(p.startDate).toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" }),
        price: p.price
      }))
  }, [prices])

  const now = new Date()
  const currentPoint = chartData.find(p => {
    const d = new Date(p.iso)
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate() &&
           d.getHours() === now.getHours()
  })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const { time, price } = payload[0].payload
      return (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: "4px" }}>
          <p style={{ margin: 0 }}>{time}</p>
          <p style={{ margin: 0 }}>{price.toFixed(2)} snt/kWh</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="iso"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(ts) =>
            new Date(ts).toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })
          }
        />
        <YAxis unit=" snt" tick={{ fontSize: 12, fill: "#000" }} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="price" stroke="#007bff" dot={false} />

        {currentPoint && (
          <>
            <ReferenceDot
              x={new Date(currentPoint.iso).getTime()}
              y={currentPoint.price}
              r={3}
              fill="red"
              stroke="red"
            />
            <ReferenceLine
              x={new Date(currentPoint.iso).getTime()}
              stroke="red"
              strokeWidth={0.5}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}