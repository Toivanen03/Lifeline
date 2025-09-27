import { useForm } from "react-hook-form"
import { useMutation, useLazyQuery } from "@apollo/client/react"
import { LOGIN, USER_BY_EMAIL, RESEND_EMAIL_VERIFICATION_TOKEN } from "../schema/queries"
import { useContext, useState, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const Login = ({ notify }) => {
    const [resendToken] = useMutation(RESEND_EMAIL_VERIFICATION_TOKEN)
    const [userExists, setUserExists] = useState(false)
    const [emailForResend, setEmailForResend] = useState("")
    const [signIn] = useMutation(LOGIN)
    const { register, handleSubmit, reset } = useForm()
    const [stayLoggedIn, setStayLoggedIn] = useState(false)
    const { login } = useContext(AuthContext)
    const [getUserByEmail] = useLazyQuery(USER_BY_EMAIL)

    const navigate = useNavigate()

    useEffect(() => {

    }, [userExists])

    const onSubmit = async (formData) => {
        setEmailForResend(formData.userName)
        try {
            const response = await signIn({
                variables: {
                username: formData.userName,
                password: formData.password,
                },
            })

            const token = response?.data?.login?.value

            if (token) {
                login(token, stayLoggedIn)
                reset()
                notify('Tervetuloa Lifelineen!', 'success')
                navigate('/')
            } else {
                const { data } = await getUserByEmail({
                    variables: {
                        email: formData.userName
                    }
                })

                if (!data?.userByEmail?.emailVerified && !data?.userByEmail?.emailVerificationToken) {
                    setUserExists(true)
                }

                const expiry = data?.userByEmail?.emailVerificationTokenExpiry

                if (expiry && expiry > new Date() && !data?.userByEmail?.emailVerified) {
                    notify('Olet jo rekisteröitynyt. Tarkista sähköpostisi vahvistaaksesi sähköpostiosoitteesi.', "info")
                    return
                } else if (expiry && expiry < new Date() && !data?.userByEmail?.emailVerified) {
                    setUserExists(true)
                    notify('Sähköpostiosoitteen vahvistaminen on vanhentunut. Tilaa uusi linkki.', "info")
                    return
                }

                notify('Täydennä puuttuvat tiedot luodaksesi tunnukset.', "info")
                navigate('/register', { state: {username: formData.userName, password: formData.password } })
                return
            }
        } catch (error) {
            if (error.message.includes("ei ole vahvistettu")) {
                notify('Sähköpostiosoitetta ei ole vahvistettu. Tarkista sähköpostisi linkki vahvistusta varten.', 'warning')
                return
            }
            if (error.message.includes("Käyttäjää ei löytynyt")) {
                navigate('/register', { state: { username: formData.userName, password: formData.password } })
                notify('Tunnusta ei löytynyt, voit luoda uuden.', 'info')
                return
            }
            notify(`VIRHE KIRJAUTUMISESSA: ${error.message}`, "error")
            }
    }

    const forgot = () => {
        navigate('/forgot')
    }

    const handleResend = async () => {
        const email = emailForResend
        if (!email) {
            notify('Sähköpostiosoite puuttuu', 'danger')
            return
        }

        try {
            await resendToken({ variables: { email } })
            notify('Uusi vahvistusviesti lähetetty', 'success')
        } catch (err) {
            notify(err.message || 'Tokenin lähetys epäonnistui', 'danger')
        }
    }

    return (
        <>
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh' }}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    autoComplete="off"
                    className="d-flex flex-column align-items-center"
                    style={{padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white'}}
                >
                    <div className="mb-3" style={{ width: 300 }}>
                        <input
                            id="userName"
                            placeholder="Sähköposti"
                            {...register("userName")}
                            className="form-control rounded"
                            required
                        />
                    </div>

                    {!userExists && (
                    <div>
                        <div className="mb-3" style={{ width: 300 }}>
                            <input
                                id="password"
                                placeholder="Salasana"
                                type="password"
                                {...register("password")}
                                className="form-control rounded"
                                required
                            />
                        </div>

                        <small style={{ color: "blue" }}>Tunnus luodaan, mikäli et ole vielä rekisteröitynyt.</small>

                        <div className="mt-4">
                            <button type="submit" className="btn btn-primary" style={{ width: 200 }}>
                                Kirjaudu
                            </button>
                        </div>

                        <div className="mb-3 mt-2 form-check d-flex justify-content-center" style={{ width: 300 }}>
                            <input
                                type="checkbox"
                                id="stayLoggedIn"
                                className="form-check-input me-2"
                                checked={stayLoggedIn}
                                onChange={() => setStayLoggedIn(!stayLoggedIn)}
                            />
                            <label htmlFor="stayLoggedIn" className="form-check-label">
                                Pysy kirjautuneena (7 vrk)
                            </label>
                        </div>

                        <div className="mt-2">
                            <span
                                onClick={forgot}
                                style={{
                                cursor: 'pointer',
                                color: 'inherit',
                                textDecoration: 'underline',
                                fontWeight: 'normal',
                                }}
                            >
                                Unohdin salasanani
                            </span>
                        </div>
                    </div>
                    )}

                    {userExists && (
                        <div style={{width: 400, padding: 20}}>
                            <span>Annettuun sähköpostiosoitteeseen on jo lähetetty vahvistusviesti. Mikäli et ole saanut viestiä, voit tilata uuden vahvistuslinkin alta. Muista tarkistaa myös roskapostikansiosi.</span>
                            <div className="mt-4">
                                <button type="button" className="btn btn-primary" style={{ width: 200 }} onClick={() => handleResend()}>
                                    Lähetä uusi vahvistusviesti
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    )
}

export default Login