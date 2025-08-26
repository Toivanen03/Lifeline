import { useForm } from "react-hook-form"
import axios from "axios"
import { LOGIN } from "../schema/queries"
import config from "../config/config"
import { useContext, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const Login = ({ notify }) => {
    const { register, handleSubmit, reset } = useForm()
    const [stayLoggedIn, setStayLoggedIn] = useState(false)
    const BACKEND_URL = config() + '/graphQl'
    const { login } = useContext(AuthContext)

    const navigate = useNavigate()

    const onSubmit = async (formData) => {
        try {
            const response = await axios.post(BACKEND_URL, {
                query: LOGIN,
                variables: {
                    username: formData.userName,
                    password: formData.password,
                },
            })

            const token = response.data?.data?.login?.value

            if (token) {
                login(token, stayLoggedIn)
                reset()
                navigate('/')
            } else {
                notify(<div>PALVELINVIRHE:<br />No token received</div>, "error")
            }
        } catch (error) {
            notify(<div>VIRHE KIRJAUTUMISESSA: {error}<br /></div>, "error")
        }
    }

    const forgot = () => {
        navigate('/forgot')
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
                </form>
            </div>
        </>
    )
}

export default Login