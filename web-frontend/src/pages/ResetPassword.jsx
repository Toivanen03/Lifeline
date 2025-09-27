import { useState, useContext } from 'react'
import { useMutation } from "@apollo/client/react"
import { AuthContext } from '../contexts/AuthContext'
import { UPDATE_PASSWORD } from '../schema/queries'
import { useNavigate } from 'react-router-dom'
import { updatePasswordSchema } from "../schema/validateUserData"

const ResetPassword = ({ notify }) => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { login, isLoggedIn } = useContext(AuthContext)

    const token = new URLSearchParams(window.location.search).get('token')

    const navigate = useNavigate()

    const submit = async (event) => {
        event.preventDefault()
        const validation = updatePasswordSchema.safeParse({ password })
        if (!validation.success) {
            notify(
                <div>
                    SALASANAN VAHVISTUS EPÄONNISTUI! <br />
                    - Salasanan on oltava vähintään 8 merkkiä <br />
                    - Salasanan tulee sisältää kirjaimia ja numeroita <br />
                    - Salasanassa tulee olla vähintään yksi erikoismerkki (!@#$%^&*(),.?)
                </div>
                , "error")
            return

        } else if (password !== confirmPassword) {
            notify("Salasanat eivät täsmää", "error")
            return
        }

        const variables = { newPassword: password }

        if (!isLoggedIn && token) {
            Object.assign(variables, { token })
        } else if (!isLoggedIn && !token) {
            notify('Ei valtuuksia!', 'error')
            navigate('/login')
        }

        updatePassword({ variables })
    }

    const [updatePassword] = useMutation(UPDATE_PASSWORD, {
        onCompleted: () => {
            !isLoggedIn && login(token)
            setPassword('')
            setConfirmPassword('')
            navigate('/')
            notify("Salasanan vaihto onnistui.", "success")
        },
        onError: (error) => {
            notify(error.message, "error")
            navigate('/')
        }
    })

    return (
        <div className="container mt-5">
            <form onSubmit={submit} className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh', }}>
                <div style={{ padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white' }}>
                    <h3 className='mb-3'>Vaihda salasana</h3>
                    {(isLoggedIn || token) ? (
                    <>
                        <span>
                            - Salasanan on oltava vähintään 8 merkkiä <br />
                            - Salasanan tulee sisältää kirjaimia ja numeroita <br />
                            - Salasanassa tulee olla vähintään yksi erikoismerkki (!@#$%^&*(),.?)
                        </span>
                        <div className='mt-3'>
                            <input
                                type='password'
                                placeholder={!isLoggedIn ? 'Salasana' : 'Uusi salasana'}
                                value={password}
                                onChange={({ target }) => setPassword(target.value)}
                                style={{ margin: 10, padding: 5 }}
                            />
                        </div>
                        <div>
                            <input
                                type='password'
                                placeholder={`Vahvista ${isLoggedIn && 'uusi '}salasana`}
                                value={confirmPassword}
                                onChange={({ target }) => setConfirmPassword(target.value)}
                                style={{ margin: 10, padding: 5 }}
                            />
                        </div>
                        <div>
                            <button type='submit' className="btn btn-primary" style={{ margin: 10 }}>Päivitä</button>
                        </div>
                    </>) : (
                        <span>Toiminto vaatii valtuutuksen</span>
                    )}
                </div>
            </form>
        </div>
    )
}

export default ResetPassword