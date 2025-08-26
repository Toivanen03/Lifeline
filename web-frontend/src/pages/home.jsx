import { useNavigate } from "react-router-dom"
import { AuthContext } from '../contexts/AuthContext'
import { useContext, useEffect } from 'react'

const Home = () => {
    const { isLoggedIn, isLoading, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            navigate('/login')
        }
    }, [isLoggedIn, isLoading, navigate])

    if (isLoading) return <div>Ladataan...</div>

    const logOut = () => {
        logout()
        navigate('/login')
    }

    return (
        <>
            <div className="d-flex justify-content-end" style={{padding: '20px'}}>
                <button
                    className="btn btn-primary"
                    style={{ width: 140 }}
                    onClick={logOut}
                    >
                    Kirjaudu ulos
                </button>
            </div>
        </>
    )
}

export default Home