import './App.css'
import Header from './components/header'
import Home from './pages/home'
import Login from './pages/login'
import Forgot from './pages/forgot'
import EmailVerify from './pages/emailverify'
import ResetPassword from './pages/ResetPassword'
import Register from './pages/register'
import ConfirmEmail from './pages/ConfirmEmail'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useQuery } from '@apollo/client/react'
import { ME } from './schema/queries'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import { useContext, useEffect, useRef } from 'react'
import { AnimatePresence } from "framer-motion"
import Cards from './components/cards'
import { ClockSettingsProvider } from './contexts/ClockContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { ElectricitySettingsProvider } from './contexts/ElectricityContext'
import { CalendarSettingsProvider } from './contexts/CalendarContext'
import { CalendarDayProvider } from './contexts/CalendarDayContext'
import { USERS } from './schema/queries'

function App() {
  const { data, refetch } = useQuery(ME)
  const { data: users } = useQuery(USERS) 
  const { isLoggedIn, isLoading, currentUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const family = users?.users || []
  const shownMessages = useRef(new Set())
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !['/register', '/forgot', '/reset-password'].some(path => location.pathname.includes(path))) {
      navigate("/login")
    }
    if (isLoggedIn) {
      refetch()
    }
  }, [isLoggedIn, isLoading, navigate, refetch, location.pathname])

  const familyName = isLoggedIn ? data?.me?.name.split(" ")[1] : null
  const firstname = isLoggedIn ? data?.me?.name.split(" ")[0] : null

  if (isLoading && !currentUser) return <div>Ladataan...</div>

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
        <Header notify={notify} firstname={firstname} familyName={familyName} navigate={navigate} />
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
                      <Route path="/confirm-email" element={<ConfirmEmail notify={notify} />} />
                        <Route path="/" element={<Home familyName={familyName} notify={notify} family={family} />}>
                        {Cards({notify, family, firstname})}
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
