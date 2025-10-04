import { Outlet, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'

const ProtectedRoute = () => {
  const { isLoggedIn, isLoading, logout } = useContext(AuthContext)
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [hasLoggedOut, setHasLoggedOut] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true)
    }, 10000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (timeoutReached && !hasLoggedOut && !isLoggedIn) {
      logout()
      setHasLoggedOut(true)
    }
  }, [timeoutReached, hasLoggedOut, isLoggedIn, logout])

  if (isLoading) return <div>Ladataan...</div>

  if (hasLoggedOut) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div
          className="d-flex flex-column align-items-center"
          style={{ padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white' }}
        >
          <span className="mb-3">
            Palvelin ei vastaa tai kirjautuminen on vanhentunut.
          </span>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Siirry kirjautumissivulle
          </button>
        </div>
      </div>
    )
  }

  if (isLoggedIn) return <Outlet />

  return <div>Varmennetaan kirjautumistietoja...</div>
}

export default ProtectedRoute