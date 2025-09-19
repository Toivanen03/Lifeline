import './App.css'
import Header from './components/header'
import Home from './pages/home'
import Login from './pages/login'
import Forgot from './pages/forgot'
import EmailVerify from './pages/emailverify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useQuery } from '@apollo/client/react'
import { ME } from './schema/queries'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import { useContext, useEffect } from 'react'
import { AnimatePresence } from "framer-motion"
import Cards from './components/cards'
import { ClockSettingsProvider } from './contexts/ClockContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { ElectricitySettingsProvider } from './contexts/ElectricityContext'
import { CalendarSettingsProvider } from './contexts/CalendarContext'
import { USERS } from './schema/queries'

function App() {
  const { data, refetch } = useQuery(ME)
  const { data: users } = useQuery(USERS) 
  const { isLoggedIn, isLoading, currentUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const family = users?.users || []

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login")
    }
    if (isLoggedIn) {
      refetch()
    }
  }, [isLoggedIn, isLoading, navigate, refetch])

  const familyName = isLoggedIn ? data?.me?.name.split(" ")[1] : null
  const firstname = isLoggedIn ? data?.me?.name.split(" ")[0] : null

  if (isLoading && !currentUser) return <div>Ladataan...</div>

  const notify = (message, type) => {
    if (type === 'success') {
      toast.success(message)
    } else if (type === 'info') {
      toast.info(message)
    }
    else toast.error(message)
  }

  return (
    <>
      <div className='d-flex flex-column vh-100 overflow-hidden'>
        <Header notify={notify} firstname={firstname} familyName={familyName} navigate={navigate} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          toastStyle={{ width: "400px", textAlign: "left" }}
        />
        <AnimatePresence>
          <SettingsProvider>
            <CalendarSettingsProvider>
              <ClockSettingsProvider>
                <ElectricitySettingsProvider>
                  <Routes>
                    <Route path="/login" element={<Login notify={notify} firstname={firstname} />} />
                    <Route path="/forgot" element={<Forgot notify={notify} />} />
                    <Route path="/reset-password" element={<ResetPassword notify={notify} />} />
                    <Route path="/emailverify" element={<EmailVerify notify={notify} />} />
                      <Route path="/" element={<Home familyName={familyName} notify={notify} family={family} />}>
                      {Cards({notify, family, firstname})}
                    </Route>
                  </Routes>
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
