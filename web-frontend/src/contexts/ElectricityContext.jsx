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

  const [electricitySettings, setElectricitySettings] = useState(() => {
    if (!currentUser) return defaultSettings
    const saved = localStorage.getItem(`${currentUser.username}.electricitySettings`)
    return saved ? JSON.parse(saved) : defaultSettings
  })

  const updateElectricitySettings = (newSettings) => {
    setElectricitySettings(newSettings)
    if (currentUser) {
      localStorage.setItem(`${currentUser.username}.electricitySettings`, JSON.stringify(newSettings))
    }
  }

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `${currentUser.username}.electricitySettings`,
        JSON.stringify(electricitySettings)
      )
    }
  }, [electricitySettings, currentUser])

  return (
    <ElectricityContext.Provider value={{
      electricitySettings,
      updateElectricitySettings
    }}>
      {children}
    </ElectricityContext.Provider>
  )
}

export const useElectricitySettings = () => useContext(ElectricityContext)