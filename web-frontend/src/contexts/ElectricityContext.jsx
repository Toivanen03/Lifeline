import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const ElectricityContext = createContext()

const defaultSettings = {
  show: true,
  future: false,
  nextHour: false,
  priceMin: 5,
  priceMax: 10,
}

export const ElectricitySettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [electricitySettings, setElectricitySettings] = useState(defaultSettings)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      setElectricitySettings(defaultSettings)
      setInitialized(true)
      return
    }

    const saved = localStorage.getItem(`${currentUser.username}.electricitySettings`)
    if (saved) {
      setElectricitySettings(JSON.parse(saved))
    } else {
      setElectricitySettings(defaultSettings)
    }
    setInitialized(true)
  }, [currentUser])

  const updateElectricitySettings = (newSettings) => {
    setElectricitySettings(newSettings)
    if (currentUser) {
      localStorage.setItem(`${currentUser.username}.electricitySettings`, JSON.stringify(newSettings))
    }
  }

  if (!initialized) return null

  return (
    <ElectricityContext.Provider value={{ electricitySettings, updateElectricitySettings }}>
      {children}
    </ElectricityContext.Provider>
  )
}

export const useElectricitySettings = () => useContext(ElectricityContext)