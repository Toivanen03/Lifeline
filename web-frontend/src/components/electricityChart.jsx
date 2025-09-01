import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts"

export const ElectricityChart = ({ prices }) => {
  const chartData = prices
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .map(p => ({
      iso: new Date(p.startDate).toISOString(),
      time: new Date(p.startDate).toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" }),
      price: p.price
    }))

  const now = new Date()
  const currentHourIso = chartData.find(p => {
    const d = new Date(p.iso)
    return d.getHours() === now.getHours() && d.getDate() === now.getDate()
  })?.iso

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
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
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="iso"
          tickFormatter={(iso) =>
            new Date(iso).toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })
          }
          tick={{ fontSize: 12, fill: "#000" }}
        />
        <YAxis unit=" snt" tick={{ fontSize: 12, fill: "#000" }} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="price" stroke="#007bff" dot={false} />

        {currentHourIso && (
          <ReferenceDot
            x={currentHourIso}
            y={chartData.find(p => p.iso === currentHourIso).price}
            r={4}
            fill="red"
            stroke="red"
            label={{ value: '', position: "top", fill: "red", fontSize: 12 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}