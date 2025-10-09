import './App.css'
import Header from './components/header'
import Home from './pages/home'
import Login from './pages/login'
import Forgot from './pages/forgot'
import EmailVerify from './pages/emailverify'
import ResetPassword from './pages/ResetPassword'
import Register from './pages/register'
import ConfirmEmail from './pages/ConfirmEmail'
import AcceptInvitation from './pages/AcceptInvitation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoute from './config/ProtectedRoute'
import { useLazyQuery } from '@apollo/client/react'
import { FAMILY } from './schema/queries'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import { useContext, useEffect, useRef } from 'react'
import { AnimatePresence } from "framer-motion"
import Cards from './components/cards'
import { ClockSettingsProvider } from './contexts/ClockContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { ElectricitySettingsProvider } from './contexts/ElectricityContext'
import { CalendarSettingsProvider } from './contexts/CalendarWidgetContext'
import { CalendarDayProvider } from './contexts/CalendarDayContext'

function App() {
  const [getFamily, { data: familyData }] = useLazyQuery(FAMILY, { fetchPolicy: "network-only" })
  const { isLoggedIn, logout, isLoading, currentUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const shownMessages = useRef(new Set())
  const location = useLocation()

  const isDataLoaded = isLoggedIn ? (familyData?.family) : true

  useEffect(() => {
    if (isLoading) return

    if (isLoggedIn) {
      getFamily()
    } else if (!['/register', '/forgot', '/reset-password', '/accept-invitation'].some(path => location.pathname.includes(path))) {
      logout()
      navigate("/login")
    }
  }, [isLoggedIn, isLoading, navigate, location.pathname, getFamily])

  const firstname = isLoggedIn ? currentUser?.name?.split(" ")[0] : null
  const family = isLoggedIn ? familyData?.family?.name : ""
  const familyMembers = isLoggedIn ? familyData?.family?.members : []

  if (!isDataLoaded) return <div>Ladataan...</div>

  const notify = (message, type) => {
    if (shownMessages.current.has(message)) return

    shownMessages.current.add(message)

    const toastOptions = {
      onClose: () => {
        shownMessages.current.delete(message)
      },
      autoClose: 3000
    }

    if (type === 'success') toast.success(message, toastOptions)
    else if (type === 'info') toast.info(message, toastOptions)
    else toast.error(message, toastOptions)
  }

  return (
    <>
      <div className='d-flex flex-column vh-100 overflow-hidden'>
        <Header notify={notify} firstname={firstname} family={family} navigate={navigate} />
        <ToastContainer
          position="top-right"
          toastStyle={{ width: "400px", textAlign: "left" }}
        />
        <AnimatePresence>
          <SettingsProvider>
            <CalendarSettingsProvider>
              <ClockSettingsProvider>
                <ElectricitySettingsProvider>
                  <CalendarDayProvider>
                    <Routes>
                      <Route path="/register" element={<Register notify={notify} />} />
                      <Route path="/login" element={<Login notify={notify} firstname={firstname} />} />
                      <Route path="/forgot" element={<Forgot notify={notify} />} />
                      <Route path="/reset-password" element={<ResetPassword notify={notify} />} />
                      <Route path="/emailverify" element={<EmailVerify notify={notify} />} />
                      <Route path="/accept-invitation" element={<AcceptInvitation notify={notify} />} />
                      <Route path="/confirm-email" element={<ConfirmEmail notify={notify} />} />
                      <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Home familyMembers={familyMembers} notify={notify} />}>
                          {Cards({notify, familyMembers, firstname})}
                        </Route>
                      </Route>
                    </Routes>
                  </CalendarDayProvider>
                </ElectricitySettingsProvider>
              </ClockSettingsProvider>
            </CalendarSettingsProvider>
          </SettingsProvider>
        </AnimatePresence>
      </div>
    </>
  )
}

export default App
