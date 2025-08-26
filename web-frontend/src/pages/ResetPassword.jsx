import { useState, useContext } from 'react'
import { useMutation } from "@apollo/client/react"
import { AuthContext } from '../contexts/AuthContext'
import { UPDATE_PASSWORD } from '../schema/queries'
import { useNavigate } from 'react-router-dom'
import { updatePasswordSchema } from "../schema/validateUserData"

const ResetPassword = ({ notify }) => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { login } = useContext(AuthContext)

    const token = new URLSearchParams(window.location.search).get('token')
    const navigate = useNavigate()

    const submit = async (event) => {
        const validation = updatePasswordSchema.safeParse({ password })
        if (validation.success) {
            event.preventDefault()
            if (password === confirmPassword) {
                notify("OK", "success")
                updatePassword({ variables: { currentPassword: password, newPassword: password, token: token } })
            } else {
                notify("SALASANAT EI TÄSMÄÄ", "error")
            }
        } else {
            notify("SALASANA VÄÄRÄÄ MUOTOA", "error")
        }
    }

    const [updatePassword] = useMutation(UPDATE_PASSWORD, {
        onError: () => {
            notify("VIRHE", "error")
        },
        onCompleted: () => {
            login(token)
            setPassword('')
            setConfirmPassword('')
            navigate('/')
        },
    })

    return (
        <div className="container mt-5">
            <form onSubmit={submit} className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh', }}>
                <div style={{ padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white' }}>
                    <h3 className='mb-3'>Vaihda salasana</h3>
                    <div>
                        <input
                            type='password'
                            placeholder='Salasana'
                            value={password}
                            onChange={({ target }) => setPassword(target.value)}
                            style={{ margin: 10, padding: 5 }}
                        />
                    </div>
                    <div>
                        <input
                            type='password'
                            placeholder='Vahvista salasana'
                            value={confirmPassword}
                            onChange={({ target }) => setConfirmPassword(target.value)}
                            style={{ margin: 10, padding: 5 }}
                        />
                    </div>
                    <div>
                        <button type='submit' className="btn btn-primary" style={{ margin: 10 }}>Päivitä</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ResetPassword