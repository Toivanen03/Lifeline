import { useEffect, useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

const AcceptInvitation = ({ notify }) => {

    const { logout, isLoggedIn } = useContext(AuthContext)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        const handleInvitation = async () => {
            if (isLoggedIn) {
                logout()
            }

            if (!token) {
                notify('Token puuttuu tai linkki on virheellinen.', 'danger')
                navigate('/')
                return
            }

            try {
                const res = await fetch('/api/accept-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invitationToken: token })
                })
                const data = await res.json()

                if (!res.ok) throw new Error(data.error || 'Vahvistus epäonnistui')

                navigate('/register', { 
                    state: { 
                        invitedUser: data.invitedUser, 
                        familyId: data.invitedUser.familyId,
                        familyName: data.invitedUser.familyName
                    } 
                })
            } catch (err) {
                notify(err.message, 'danger')
                navigate('/')
            }
        }

        handleInvitation()
    }, [token, notify, navigate, isLoggedIn, logout])
}

export default AcceptInvitation