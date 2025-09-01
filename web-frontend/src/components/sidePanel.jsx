import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome'
import { faPeopleRoof, faBasketShopping, faUserTie, faSchool, faClipboardList, faBroom, faUserPlus, faGear } from '@fortawesome/free-solid-svg-icons'

const SidePanel = ({ family, showCard }) => {
    return (
        <>
            {family ? (<div className="bg-light border-end h-100">
            <ul className="nav flex-column text-center">
                <li className="nav-item my-3">
                <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                    e.preventDefault()
                    showCard('/family')
                }}>
                    <FontAwesomeIcon icon={faPeopleRoof} fontSize={35} color="#1C1C1C" /><br />
                    Perheen hallinta
                </a>
                </li>
                <li className="nav-item my-3">
                <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                    e.preventDefault()
                    showCard('/shoppinglist')
                }}>
                    <FontAwesomeIcon icon={faBasketShopping} fontSize={35} color="#1C1C1C"  /><br />
                    Ostoslistat
                </a>
                </li>
                <li className="nav-item my-3">
                <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                    e.preventDefault()
                    showCard('/shifts')
                }}>
                    <FontAwesomeIcon icon={faUserTie} fontSize={35} color="#1C1C1C"  /><br />
                    Työvuorot
                </a>
                </li>
                <li className="nav-item my-3">
                <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                    e.preventDefault()
                    showCard('/schedules')
                }}>
                    <FontAwesomeIcon icon={faSchool} fontSize={35} color="#1C1C1C"  /><br />
                    Lukujärjestykset
                </a>
                </li>
                <li className="nav-item my-3">
                <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                    e.preventDefault()
                    showCard('/todos')
                }}>
                    <FontAwesomeIcon icon={faClipboardList} fontSize={35} color="#1C1C1C"  /><br />
                    Tehtävälistat
                </a>
                </li>
                <li className="nav-item my-3">
                <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                    e.preventDefault()
                    showCard('/chores')
                }}>
                    <FontAwesomeIcon icon={faBroom} fontSize={35} color="#1C1C1C"  /><br />
                    Siivousvuorot
                </a>
                </li>
                <li className="nav-item my-3">
                <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                    e.preventDefault()
                    showCard('/invite')
                }}>
                    <FontAwesomeIcon icon={faUserPlus} fontSize={35} color="#1C1C1C" /><br />
                    Lähetä kutsuja
                </a>
                </li>
                <li className="nav-item my-3">
                <a href="#" className="nav-link" style={{ color: '#1C1C1C' }} onClick={(e) => { 
                    e.preventDefault()
                    showCard('/settings')
                }}>
                    <FontAwesomeIcon icon={faGear} fontSize={35} color="#1C1C1C" /><br />
                    Asetukset
                </a>
                </li>
            </ul>
            </div>
            ) : (
            <div className="col-1"></div>
            )}
        </>
    )
}

export default SidePanel