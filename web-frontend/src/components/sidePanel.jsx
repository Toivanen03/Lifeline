import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome'
import { faUtensils, faBasketShopping, faUserTie, faSchool, faClipboardList, faBroom, faPeopleRoof, faGear } from '@fortawesome/free-solid-svg-icons'

const SidePanel = ({ familyMembers, showCard }) => {
    if (!familyMembers) return <div className="col-1"></div>

    const links = [
        { icon: faBasketShopping, label: 'Ostoslistat', path: '/shoppinglist' },
        { icon: faUtensils, label: 'Ruokalistat', path: '/mealmenus' },
        { icon: faUserTie, label: 'Työvuorot', path: '/shifts' },
        { icon: faSchool, label: 'Lukujärjestykset', path: '/schedules' },
        { icon: faClipboardList, label: 'Tehtävälistat', path: '/todos' },
        { icon: faBroom, label: 'Siivousvuorot', path: '/chores' },
        { icon: faPeopleRoof, label: 'Perhe', path: '/family' },
        { icon: faGear, label: 'Asetukset', path: '/settings' },
    ]

    return (
        <div className='container d-flex flex-column align-items-center bg-light' style={{ height: '89vh', width: '10vw', borderRight: '1px solid #ccc' }}>
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