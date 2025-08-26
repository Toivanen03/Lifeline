import './App.css'
import Home from './pages/home'
import Login from './pages/login'
import Forgot from './pages/forgot'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Routes, Route } from 'react-router-dom'

function App() {
  const notify = (message, type = 'success') => {
    if (type === 'success') toast.success(message)
    else toast.error(message)
  }

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '10vh' }}>
        <h2 className="mt-5">Lifeline ©</h2>
        <h3>Web Control Panel</h3>
      </div>
      <ToastContainer position="top-right" autoClose={5000} toastStyle={{ width: "400px", textAlign: 'left' }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login notify={notify} />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset-password" element={<ResetPassword notify={notify} />} />
      </Routes>
    </>
  )
}

export default App
