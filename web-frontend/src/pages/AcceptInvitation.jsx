import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const AcceptInvitation = ({ notify }) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            notify('Token puuttuu tai linkki on virheellinen.', 'danger')
            navigate('/')
            return
        }

    const verify = async () => {
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
                familyId: data.invitedUser.familyId 
            } 
        })

        } catch (err) {
        notify(err.message, 'danger')
        navigate('/')
        }
    }

    verify()
    }, [token, notify, navigate])
}

export default AcceptInvitation