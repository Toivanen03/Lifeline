import { useForm } from "react-hook-form"
import { useMutation } from "@apollo/client/react"
import { ADD_USER } from "../schema/queries"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { updatePasswordSchema, validateFullName, validateEmail } from "../../../mobile-app/schema/validateUserData"

const Register = ({ notify }) => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [seconds, setSeconds] = useState(null)
    const [createUser] = useMutation(ADD_USER)
    const { register, handleSubmit, watch } = useForm({
        defaultValues: {
        userName: state?.username || state?.invitedUser?.email || "",
        password: state?.password || "",
        lastname: state?.invitedUser?.familyName || ""
        }
    })

    const invited = !!state?.invitedUser
    const familyId = state?.invitedUser?.familyId
    const inviteId = state?.invitedUser?.id
    
    const consent = watch("consent")

    useEffect(() => {
        if (seconds === null) return
        if (seconds <= 0) {
            navigate("/")
            return
        }

        const timer = setInterval(() => {
            setSeconds(s => s - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [seconds, navigate])

    const onSubmit = async (formData) => {
        const firstname = formData.firstname.trim().replace(/\s+/g, '')
        const lastname = formData.lastname.trim().replace(/\s+/g, '')
        const name = firstname.charAt(0).toUpperCase() + firstname.slice(1) + ' ' + lastname.charAt(0).toUpperCase() + lastname.slice(1)

        if (!validateEmail.safeParse({ email: formData.userName }).success) {
            notify("Virheellinen sähköpostiosoite", "error")
        return
        }

        if (!validateFullName.safeParse({ fullName: name}).success) {
            notify("Etu- ja sukunimessä on oltava vähintään kaksi kirjainta,\neivätkä ne saa sisältää numeroita tai erikoismerkkejä.", "error")
        return
        }

        if (!updatePasswordSchema.safeParse({ password: formData.password }).success) {
            notify('- Salasanan on oltava vähintään 8 merkkiä\n- Salasanassa kirjaimia ja numeroita\n- Vähintään yksi erikoismerkki (!@#$%^&*(),.?)', 'error')
        return
        }

        if (formData.password !== formData.confirmPassword) {
            notify('Salasanat eivät täsmää', 'error')
        return
        }

        if (!invited) {
            try {
                const response = await createUser({
                    variables: {
                        username: formData.userName,
                        name: name,
                        password: formData.password,
                        parent: true,
                    }
                })

                if (response) {
                    notify(
                    `Perhe ${lastname} luotu onnistuneesti. Vahvista käyttäjätunnuksesi sähköpostiisi lähetetyn linkin avulla.`,
                    "success"
                    )
                    setSeconds(10)
                }
            } catch (error) {
                notify(`Virhe käyttäjän luomisessa: ${error.message}`, "error")
            }
        } else {
            try {
                const response = await createUser({
                    variables: {
                        username: formData.userName,
                        name: name,
                        password: formData.password,
                        parent: state?.invitedUser?.parent || false,
                        familyId,
                        invitedUserId: inviteId
                    }
                })
                if (response) {
                    notify(
                    `Perheeseen liittyminen onnistui. Voit nyt kirjautua Lifelineen.`,
                    "success"
                    )
                    setSeconds(5)
                }
            } catch (error) {
                notify(`Virhe: ${error.message}`, "error")
            }
        }
    }

    const terms = () => {
        // TÄHÄN JOKU EHTOMODAALI
        console.log("EHDOT")
    }

    return (
        <>
            <div className="d-flex flex-column justify-content-center align-self-center mt-5" style={{ height: '50vh', width: '25%' }}>
                {!seconds && (<form
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
                            disabled={invited}
                        />
                    </div>

                    <div className="d-flex mb-3" style={{ width: 300, gap: 8 }}>
                        <input
                            id="firstname"
                            placeholder="Etunimi"
                            {...register("firstname")}
                            className="form-control rounded"
                            required
                            style={{ flex: 1 }}
                        />
                        <input
                            id="lastname"
                            placeholder="Sukunimi"
                            {...register("lastname")}
                            className="form-control rounded"
                            required
                            style={{ flex: 1 }}
                        />
                    </div>

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

                    <div className="mb-3" style={{ width: 300 }}>
                        <input
                            id="confirmPassword"
                            placeholder="Vahvista salasana"
                            type="password"
                            {...register("confirmPassword")}
                            className="form-control rounded"
                            required
                        />
                    </div>

                    <div className="text-center mt-3" style={{padding: 10}}>
                        {!invited ? (
                            <p>Rekisteröitymällä Lifelinen käyttäjäksi luot<b style={{color: 'blue'}}> pääkäyttäjän tunnukset ja uuden perheen</b>, etkä voi liittyä jo olemassa olevaan perheeseen. Mikäli haluat tunnusten luomisen sijaan
                                <i> liittyä</i> perheeseen, <i>pyydä perheesi Parent-käyttäjältä kutsulinkki</i> sähköpostiisi.
                            </p>
                        ) : (
                            <p>Rekisteröitymällä Lifelinen käyttäjäksi <b style={{color: 'blue'}}>liityt perheeseen, jolta sait kutsulinkin.</b>
                            </p>
                        )}
                    </div>

                    <div className="mb-1 align-items-center text-center" style={{ width: 300 }}>
                        <span className="me-3">
                            Hyväksyn <a href="#" onClick={terms}>käyttöehdot</a>
                        </span>

                        <input
                            id="consent"
                            type="checkbox"
                            {...register("consent")}
                            required
                            style={{ verticalAlign: 'middle'}}
                        />
                    </div>

                    <div className="mt-3">
                        <button type="submit" className="btn btn-primary" style={{ width: 200 }} disabled={!consent}>
                            Rekisteröidy
                        </button>
                    </div>
                </form>)}
                {seconds && (
                    <div className="d-flex flex-column align-items-center"
                        style={{padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white'}}>
                        <span className="mt-3 mb-3 ">
                            Sivu ohjautuu automaattisesti kirjautumissivulle {seconds} sekunnin kuluttua.
                        </span>

                        <button type="button" className="btn btn-primary" style={{ width: 200 }} onClick={() => navigate('/login')}>
                                Siirry kirjautumissivulle
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default Register