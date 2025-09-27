import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { VERIFY_EMAIL_OR_INVITE } from '../schema/queries'

const ConfirmEmail = ({ notify }) => {
  const [status, setStatus] = useState('Tarkistetaan...')
  const [seconds, setSeconds] = useState(10)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [verifyEmailOrInvite] = useMutation(VERIFY_EMAIL_OR_INVITE)

  useEffect(() => {
    if (!token) {
      notify('Token puuttuu tai linkki on virheellinen.', 'danger')
      return
    }

    const verify = async () => {
      try {
        const { data, errors } = await verifyEmailOrInvite({ variables: { token } })

        if (errors && errors.length > 0) {
          throw new Error(errors[0].message)
        }

        if (!data || !data.verifyEmailOrInvite) {
          setStatus("Vahvistus epäonnistui")
          notify("Token on vanhentunut tai sähköposti on jo vahvistettu", "danger")
          return
        }

        setStatus("Onnistui")
        notify("Sähköpostiosoite vahvistettu onnistuneesti.", "success")

      } catch (err) {
        console.error(err)
        const msg = err.message || 'Vahvistus epäonnistui.'
        setStatus(msg)
        notify(msg, 'danger')
      }
    }

    verify()
  }, [token, verifyEmailOrInvite, notify])

  useEffect(() => {
    if (seconds <= 0) {
      navigate('/login')
      return
    }
    const timer = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds, navigate])

  return (
    <div className="container mt-5">
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div style={{ padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white' }}>
          <h3 className="mb-3">{status}</h3>
          {status.includes('Onnistui') && (
            <div className="d-flex flex-column align-items-center" style={{ padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white' }}>
              <span className="mt-3 mb-3">
                Sivu ohjautuu automaattisesti kirjautumissivulle {seconds} sekunnin kuluttua.
              </span>
              <button type="button" className="btn btn-primary" style={{ width: 200 }} onClick={() => navigate('/login')}>
                Siirry kirjautumissivulle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmEmail