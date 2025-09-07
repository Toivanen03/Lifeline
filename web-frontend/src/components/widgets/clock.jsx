import { useClockSettings } from "../../contexts/ClockContext"
import { Clock as Analog } from "react-clock"
import "react-clock/dist/Clock.css"
import { useState, useEffect } from "react"

export const ClockWidget = () => {
  const { clockSettings } = useClockSettings()
  const [value, setValue] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const Digital = () => {
    const [ctime, setTime] = useState(new Date().toLocaleTimeString())

    useEffect(() => {
      const timer = setInterval(() => {
        setTime(new Date().toLocaleTimeString())
      }, 1000)
      return () => clearInterval(timer)
    }, [])

    return <div className="digital-time">{ctime}</div>
  }

  return (
    <>
      {clockSettings.show && (
        <div style={{ borderBottom: "1px solid #ccc" }}>
          {clockSettings.digital ? (
            <div className="d-flex justify-content-center mb-3">
              <Analog value={value} size={120} />
            </div>
          ) : (
            <div className="d-flex justify-content-center digital">
              <Digital />
            </div>
          )}
        </div>
      )}
    </>
  )
}