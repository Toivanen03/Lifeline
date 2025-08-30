import { useNavigate, Outlet } from "react-router-dom"
import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome'
import { faPeopleRoof, faBasketShopping, faUserTie, faSchool, faClipboardList, faBroom, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { useState } from "react"
import { WeatherWidget } from "../components/widgets/weather"
import WeatherSettings from "../components/settings/WeatherSettings"
import { WeatherSettingsProvider } from "../contexts/WeatherContext"

const Home = ({ family }) => {
  const [mouseDownInsideCard, setMouseDownInsideCard] = useState(false)

  const navigate = useNavigate()

  const showPanel = (panel) => {
    navigate(panel)
  }

    const handleMouseDown = (e) => {
    if (e.target.closest('.card')) {
      setMouseDownInsideCard(true)
    } else {
      setMouseDownInsideCard(false)
    }
  }

  const handleMouseUp = () => {
    if (!mouseDownInsideCard) {
      showPanel('/')
    }
    setMouseDownInsideCard(false)
  }

  return (
    <WeatherSettingsProvider>
      <div className="row flex-grow-1">
        {/* VASEN SIVUPALKKI */}
        {family ? (<div className="col-1 bg-light border-end p-3 d-flex flex-column align-items-center justify-content-center">
          <ul className="nav flex-column flex-fill justify-content-between text-center">
            <li className="nav-item my-3">
              <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                e.preventDefault()
                showPanel('/settings')
              }}>
                <FontAwesomeIcon icon={faPeopleRoof} fontSize={35} color="#1C1C1C" /><br />
                Perheen hallinta
              </a>
            </li>
            <li className="nav-item my-3">
              <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                e.preventDefault()
                showPanel('/shoppinglist')
              }}>
                <FontAwesomeIcon icon={faBasketShopping} fontSize={35} color="#1C1C1C"  /><br />
                Ostoslistat
              </a>
            </li>
            <li className="nav-item my-3">
              <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                e.preventDefault()
                showPanel('/shifts')
              }}>
                <FontAwesomeIcon icon={faUserTie} fontSize={35} color="#1C1C1C"  /><br />
                Työvuorot
              </a>
            </li>
            <li className="nav-item my-3">
              <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                e.preventDefault()
                showPanel('/schedules')
              }}>
                <FontAwesomeIcon icon={faSchool} fontSize={35} color="#1C1C1C"  /><br />
                Lukujärjestykset
              </a>
            </li>
            <li className="nav-item my-3">
              <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                e.preventDefault()
                showPanel('/todos')
              }}>
                <FontAwesomeIcon icon={faClipboardList} fontSize={35} color="#1C1C1C"  /><br />
                Tehtävälistat
              </a>
            </li>
            <li className="nav-item my-3">
              <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                e.preventDefault()
                showPanel('/chores')
              }}>
                <FontAwesomeIcon icon={faBroom} fontSize={35} color="#1C1C1C"  /><br />
                Siivousvuorot
              </a>
            </li>
            <li className="nav-item my-3">
              <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                e.preventDefault()
                showPanel('/invite')
              }}>
                <FontAwesomeIcon icon={faUserPlus} fontSize={35} color="#1C1C1C" /><br />
                Lähetä kutsuja
              </a>
            </li>
          </ul>
        </div>
        ) : (
          <div className="col-1"></div>
        )}

        {/* KESKIALUE */}
        <div
          className="col-9 p-4 overflow-auto"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <Outlet />
        </div>

        {/* OIKEA INFO-PANEELI */}
        {family && (<div className="col-2 bg-light border-start p-3 d-flex flex-column align-items-center">
          <div className="mb-3">
            <h6>Kello</h6>
            {/* TODO: kellonaika komponentti */}
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="mb-3">
            <WeatherWidget />
          </div>
          <div className="mb-3">
            <h6>Sähkön hinta</h6>
            <span>12 snt/kWh</span>
          </div>
        </div>
        )}
      </div>
      <WeatherWidget />
      <WeatherSettings />
    </WeatherSettingsProvider>
  )
}

export default Home