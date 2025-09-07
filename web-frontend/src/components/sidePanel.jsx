import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome'
import { faPeopleRoof, faBasketShopping, faUserTie, faSchool, faClipboardList, faBroom, faUserPlus, faGear } from '@fortawesome/free-solid-svg-icons'

const SidePanel = ({ familyName, showCard }) => {
    if (!familyName) return <div className="col-1"></div>

    const links = [
        { icon: faPeopleRoof, label: 'Perheen hallinta', path: '/family' },
        { icon: faBasketShopping, label: 'Ostoslistat', path: '/shoppinglist' },
        { icon: faUserTie, label: 'Työvuorot', path: '/shifts' },
        { icon: faSchool, label: 'Lukujärjestykset', path: '/schedules' },
        { icon: faClipboardList, label: 'Tehtävälistat', path: '/todos' },
        { icon: faBroom, label: 'Siivousvuorot', path: '/chores' },
        { icon: faUserPlus, label: 'Lähetä kutsuja', path: '/invite' },
        { icon: faGear, label: 'Asetukset', path: '/settings' },
    ]

    return (
        <div className='container p-1 d-flex flex-column align-items-center bg-light' style={{ height: '89vh', borderRight: '1px solid #ccc' }}>
            <ul className="nav flex-column flex-grow-1 d-flex justify-content-between">
                {links.map(link => (
                    <li key={link.path} className="nav-item">
                        <a
                            href="#"
                            className="nav-link"
                            style={{ color: '#1C1C1C' }}
                            onClick={e => { e.preventDefault(); showCard(link.path) }}
                        >
                            <FontAwesomeIcon icon={link.icon} fontSize={35} color="#1C1C1C" /><br />
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SidePanel