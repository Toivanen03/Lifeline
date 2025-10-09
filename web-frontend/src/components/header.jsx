import { AuthContext } from "../contexts/AuthContext"
import { useContext } from 'react'

const Header = ({ notify, navigate }) => {
    const { logout, currentUser, isLoggedIn } = useContext(AuthContext)

    const logOut = () => {
        if (window.confirm("Haluatko varmasti kirjautua ulos?")) {
            logout()
            notify("Uloskirjautuminen onnistui.", "info")
            navigate("/login")
        }
    }
    return (
        <header className="container-fluid bg-dark text-white p-2">
            <div className="row align-items-center">
                <div className="col-3">
                    {isLoggedIn && <><h4>Perhe {currentUser.name.split(' ')[1]}</h4> <small>{currentUser.name.split(' ')[0]} kirjautuneena</small></>}
                </div>
                <div className="col-5 text-center">
                    <h4>Lifeline ©</h4>
                    <h5>Web Control Panel</h5>
                </div>
                <div className="col-3 text-end">
                {isLoggedIn && (
                    <button
                        className="btn btn-outline-light btn-sm"
                        onClick={logOut}>
                    Kirjaudu ulos
                    </button>
                )}
                </div>
            </div>
        </header>
    )
}

export default Header