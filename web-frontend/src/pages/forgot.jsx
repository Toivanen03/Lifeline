import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { validateEmail } from "../schema/validateUserData"

const Forgot = () => {
    const [email, setEmail] = useState('')

    const navigate = useNavigate()

    const pwdReset = async () => {
        const validation = validateEmail.safeParse({ email })
        if (!validation.success) {
            return
        }

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email })
            })

            if (!response.ok) {
                return
            } else {
                setEmail('')
                navigate('/')
            }

        } catch (error) {
            errorHandler(setConfirmTitle, 'Verkkovirhe tai palvelin ei vastaa')
        }
    }

    return (
        <>
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="card shadow-lg p-4 align-items-center"
                style={{padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white', width: '40%'}}
            >
                <span className="mb-4">
                    Anna sähköpostiosoite, jota käytit ottaessasi Lifeline © -sovelluksen käyttöön.
                    <br /><br />
                    Mikäli osoite löytyy järjestelmästämme, lähetämme sähköpostiisi linkin uuden salasanan luomiseksi.
                    <br /><br />
                    <u>Linkki on voimassa 15 minuutin ajan.</u>
                </span>
                <div className="mb-3" style={{ width: 300 }}>
                    <input
                        id="userName"
                        placeholder="email@esimerkki.fi"
                        onChange={({ target }) => setEmail(target.value)}
                        className="form-control rounded"
                        required
                    />
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={pwdReset}
                        className="btn btn-primary"
                        >
                        Lähetä
                    </button>
                </div>
            </div>
        </div>
        </>
    )
}

export default Forgot