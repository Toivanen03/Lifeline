import './App.css'
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

function App() {
  const { data, refetch } = useQuery(ME)
  const { isLoggedIn, isLoading, currentUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login")
    }
    if (isLoggedIn) {
      refetch()
    }
  }, [isLoggedIn, isLoading, navigate, refetch])

  const family = isLoggedIn ? data?.me?.name.split(" ")[1] : null
  const firstname = isLoggedIn ? data?.me?.name.split(" ")[0] : null

  if (isLoading && !currentUser) return <div>Ladataan...</div>

  const notify = (message, type) => {
    toast.dismiss()
    if (type === 'success') {
      toast.success(message)
    } else if (type === 'info') {
      toast.info(message)
    }
    else toast.error(message)
  }

  const logOut = () => {
    logout()
    notify("Olet kirjautunut ulos", "info")
    navigate("/login")
  }

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row bg-dark text-white p-3 align-items-center">
        <div className="col-3">
          {family && <><h4>Perhe {family}</h4> <small>{firstname} kirjautuneena</small></>}
        </div>
        <div className="col-5 text-center">
          <h4>Lifeline ©</h4>
          <h5>Web Control Panel</h5>
        </div>
        <div className="col-3 text-end">
          {family && (
            <button className="btn btn-outline-light btn-sm" onClick={logOut}>
              Kirjaudu ulos
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-grow-1 p-3">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          toastStyle={{ width: "400px", textAlign: "left" }}
        />
        <AnimatePresence>
          <Routes>
            <Route path="/login" element={<Login notify={notify} firstname={firstname} />} />
            <Route path="/forgot" element={<Forgot notify={notify} />} />
            <Route path="/reset-password" element={<ResetPassword notify={notify} />} />
            <Route path="/emailverify" element={<EmailVerify notify={notify} />} />
              <Route path="/" element={<Home family={family} />}>
              {Cards({notify})}
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
