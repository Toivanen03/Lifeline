import { AuthContext } from "../../contexts/AuthContext"
import { useContext, useState } from "react"
import { validateEmail } from "../../schema/validateUserData"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { motion } from "framer-motion"

const Invitation = ({ notify }) => {
    const { currentUser, token } = useContext(AuthContext)
    const [email, setEmail] = useState('')
    const [familyMembersToInvite, setFamilyMembersToInvite] = useState([])
    const maxLength = 10
    const familyId = currentUser.familyId

    const tryAddEmail = (rawEmail) => {
        const trimmed = rawEmail.trim().toLowerCase()
        if (!trimmed) return false

        if (familyMembersToInvite.length >= maxLength) {
            setEmail('')
            return notify("Olet jo lisännyt maksimimäärän käyttäjiä.", "info"), false
        }

        if (!validateEmail.safeParse({ email: trimmed }).success)
            return notify("Virheellinen sähköpostiosoite", "error"), false

        if (trimmed === currentUser.username)
            return notify("Olet jo käyttäjä.", "info"), false

        if (familyMembersToInvite.some(u => u.email === trimmed))
            return notify("Olet jo lisännyt tämän sähköpostiosoitteen.", "info"), false

        setFamilyMembersToInvite(prev => [...prev, { email: trimmed, parent: false }])
        return true
    }

    const addFamilyMember = () => {
        if (tryAddEmail(email)) setEmail('')
    }

    const toggleParent = (index) => {
        setFamilyMembersToInvite(prev => prev.map((user, i) =>
            i === index ? { ...user, parent: !user.parent } : user
        ))
    }

    const sendInvitations = async () => {
        const trimmedEmail = email.trim()
        let finalEmails = [...familyMembersToInvite]

        if (trimmedEmail && !finalEmails.some(u => u.email === trimmedEmail.toLowerCase())) {
            const added = tryAddEmail(trimmedEmail)
            if (!added) return
            finalEmails.push({ email: trimmedEmail.toLowerCase(), parent: false })
        }

        if (finalEmails.length === 0) return notify("Ei kutsuttavia sähköposteja", "info")

        const payload = finalEmails.map(u => ({ ...u, familyId }))

        try {
            const response = await fetch('/api/lifeline-invitation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ invitedUsers: payload })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Kutsujen lähetys epäonnistui')

            notify(data.message || 'Kutsut lähetetty', 'success')
            setFamilyMembersToInvite([])
            setEmail('')
        } catch (err) {
            console.error(err)
            notify(err.message, 'error')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ maxHeight: '100vh' }}
        >
            <div
                className="card shadow-lg p-4 align-items-center"
                onClick={e => e.stopPropagation()}
                style={{
                    padding: 10,
                    border: '1px solid black',
                    borderRadius: 20,
                    backgroundColor: 'white',
                    width: '40%'
                }}
            >
            {currentUser.isOwner ? (
            <>
                <h4 className="mb-5">Kutsu perheenjäsenesi Lifelinen käyttäjiksi!</h4>
                <span className="mb-4">Voit lähettää kutsun jopa 10:lle perheenjäsenelle!</span>
                <small className="mb-2" style={{border: '1px solid black', borderRadius: 10, padding: 10}}>Voit halutessasi antaa valituille perheenjäsenille laajemmat parent-oikeudet jo kutsun lähettämisen yhteydessä. Vanhemmalla on esimerkiksi mahdollisuus muuttaa lapsijäsenien ilmoitusasetuksia.
                    Perheen perustajajäsen voi muokata parent-valtuuksia myöhemmin hallintapaneelin kautta.
                </small>
                {familyMembersToInvite.length > 0 && <div className="col-12 text-end mb-2"> 
                    <small><strong>Vanhempi:</strong></small>
                </div>}
                <div className="mb-4 row w-100 text-end">
                    {familyMembersToInvite.map((user, i) => (
                        <div key={i} className="d-flex align-items-center justify-content-between mb-2 w-100">
                            <div className="col-8 text-center">
                                <span>{user.email}</span>
                            </div>
                            <div className="col-2">
                                <button
                                    type="button"
                                    style={{ border: 'none', color: 'red', marginLeft: 10 }}
                                    onClick={() => setFamilyMembersToInvite(familyMembersToInvite.filter((_, idx) => idx !== i))}
                                >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                            </div>
                            <div className="col-2">
                                <input
                                    className="me-3"
                                    type="checkbox"
                                    checked={user.parent}
                                    onChange={() => toggleParent(i)}
                                />
                            </div>
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
                    {email ? (
                        <button
                            type="button"
                            onClick={addFamilyMember}
                            className="btn btn-primary"
                            style={{ width: 160 }}
                        >
                            Lisää perheenjäsen
                        </button>
                    ) : (
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
                </>
             ) : (
                <h3>Vain perheen pääkäyttäjä voi lähettää kutsuja.</h3>
            )}
            </div>
        </motion.div>
    )
}

export default Invitation