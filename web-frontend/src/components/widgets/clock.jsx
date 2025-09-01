import { useClockSettings } from "../../contexts/ClockContext"
import { Clock as Analog } from 'react-clock'
import 'react-clock/dist/Clock.css'
import { useState, useEffect } from 'react'

export const ClockWidget = () => {
  const { clockSettings } = useClockSettings()
  const [value, setValue] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);
    return () => clearInterval(interval);
  }, [])

    const Digital = () =>{
        let time  = new Date().toLocaleTimeString()

        const [ctime,setTime] = useState(time)
        const UpdateTime=()=>{
            time =  new Date().toLocaleTimeString()
            setTime(time)
        }
        setInterval(UpdateTime)
        return <h1>{ctime}</h1>
    }

  return (
    <>
        {clockSettings.show && (
            <div>
            {clockSettings.digital ? (
            <div className="d-flex justify-content-center">
                <Analog value={value} />
            </div>
            ) : (
            <div className="d-flex justify-content-center digital">
                {<Digital />}
            </div>
                )}
            </div>
        )}
    </>
  )
}