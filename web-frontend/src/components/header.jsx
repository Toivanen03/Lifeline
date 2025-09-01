import { AuthContext } from "../contexts/AuthContext"
import { useContext } from 'react'

const Header = ({ notify, family, firstname, navigate }) => {
    const { logout } = useContext(AuthContext)

    const logOut = () => {
        logout()
        notify("Olet kirjautunut ulos", "info")
        navigate("/login")
    }
    return (
        <div className="row bg-dark text-white p-3 align-items-center flex-shrink-0">
            <div className="col-3">
                {family && <><h4>Perhe {family}</h4> <small>{firstname} kirjautuneena</small></>}
            </div>
            <div className="col-5 text-center">
                <h4>Lifeline ©</h4>
                <h5>Web Control Panel</h5>
            </div>
            <div className="col-3 text-end">
            {family && (
                <button className="btn btn-outline-light btn-sm" onClick={logOut}>
                Kirjaudu ulos
                </button>
            )}
            </div>
        </div>
    )
}

export default Header