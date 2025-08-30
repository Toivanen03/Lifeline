import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import { useContext, useEffect } from 'react'
import { useState } from "react"
import { validateEmail } from "../../schema/validateUserData"
import { useMutation } from "@apollo/client/react"
import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { motion } from "framer-motion"

const Chores = ({ notify }) => {
    const { isLoggedIn, isLoading, currentUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [familyMembers, setFamilyMembers] = useState([])

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            navigate('/login')
        }
    }, [isLoggedIn, isLoading, navigate])

    const addFamilyMember = () => {
        const validation = validateEmail.safeParse({ email })
        if (!validation.success) {
            notify('Virheellinen sähköpostiosoite', 'error')
            return
        }

        if (email.toLowerCase() !== currentUser.username) {
            if (!familyMembers.some(e => e.toLowerCase() === email.toLowerCase())) {
                setFamilyMembers(prev => [...prev, email.toLowerCase()])
                setEmail('')
            } else {
                notify('Olet jo lisännyt tämän sähköpostiosoitteen.', 'info')
                setEmail('')
                return
            }
        } else {
            notify('Olet jo käyttäjä.', 'info')
            setEmail('')
            return
        }
    }

    const sendInvitations = () => {
        // TÄHÄN LISÄTÄÄN KUTSUJEN LÄHETTÄMINEN MYÖHEMMIN
        familyMembers.forEach(e => console.log(e))
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: '50vh' }}
        >
            <div className="card shadow-lg p-4 align-items-center" onClick={e => e.stopPropagation()}
            style={{padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white', width: '40%'}}
            >
                <h4 className="mb-5">
                    Kutsu perheenjäsenesi Lifelinen käyttäjiksi!
                </h4>
                <div className="mb-4">
                    {familyMembers.map((email, index) => (
                        <div key={index} className="d-flex align-items-center mb-1">
                        <span>{email}</span>
                        <button
                            type="button"
                            style={{ border: 1, borderRadius: 20, padding: 2, color: 'red', marginLeft: 20 }}
                            onClick={() => {
                            setFamilyMembers(familyMembers.filter((_, i) => i !== index))
                            }}
                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                        </div>
                    ))}
                </div>
                <div className="mb-3" style={{ width: 300 }}>
                    <input
                        id="userName"
                        placeholder="email@esimerkki.fi"
                        value={email}
                        onChange={({ target }) => setEmail(target.value)}
                        className="form-control rounded"
                        required
                    />
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={addFamilyMember}
                        className="btn btn-primary"
                        style={{ width: 160 }}
                        >
                        Lisää perheenjäsen
                    </button>
                    {familyMembers.length > 0 && (
                        <button
                            type="button"
                            onClick={sendInvitations}
                            className="btn btn-primary"
                            style={{ marginLeft: 20, width: 160 }}
                            >
                            Lähetä kutsut
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default Chores