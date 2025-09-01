import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const ElectricityContext = createContext()

export const ElectricitySettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [electricitySettings, setSettings] = useState({
    show: true,
    future: false
  })

  useEffect(() => {
    if (!currentUser) return
    const saved = localStorage.getItem(`${currentUser.username}.electricitySettings`)
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [currentUser])

  const updateElectricitySettings = (newSettings) => {
    if (!currentUser) return
    setSettings(newSettings)
    localStorage.setItem(`${currentUser.username}.electricitySettings`, JSON.stringify(newSettings))
  }

  return (
    <ElectricityContext.Provider value={{ electricitySettings, updateElectricitySettings }}>
      {children}
    </ElectricityContext.Provider>
  )
}

export const useElectricitySettings = () => useContext(ElectricityContext)