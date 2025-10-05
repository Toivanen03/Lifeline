import { AuthContext } from "../../contexts/AuthContext"
import { useContext, useState, useEffect } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { validateEmail } from "../../schema/validateUserData"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { hover, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { GET_INVITED_USERS, UPDATE_PARENT, DELETE_USER, CANCEL_INVITATION } from "../../schema/queries"

const Family = ({ notify, familyMembers }) => {
    const { currentUser, token } = useContext(AuthContext)
    const [familyMembersList, setFamilyMembersList] = useState(familyMembers)
    const [invitedList, setInvitedList] = useState([])
    const [email, setEmail] = useState('')
    const [familyMembersToInvite, setFamilyMembersToInvite] = useState([])
    const [updateParent] = useMutation(UPDATE_PARENT)
    const [deleteUser] = useMutation(DELETE_USER)
    const [cancelInvitation] = useMutation(CANCEL_INVITATION)
    const maxLength = 10
    const familyId = currentUser.familyId

    const navigate = useNavigate()

    const { data: invitedData, refetch: refetchInvited } = useQuery(GET_INVITED_USERS, {
        variables: { familyId: currentUser.familyId }
    })

    useEffect(() => {
        if (invitedData) {
            setInvitedList(invitedData.invitedUsers)
        }
    }, [invitedData])

    const tryAddEmail = (rawEmail) => {
        const trimmed = rawEmail.trim().toLowerCase()
        if (!trimmed) return false
        if ((familyMembersToInvite.length + invitedList.length + familyMembers.length) < 10) {
            if (familyMembersToInvite.some(u => u.email === trimmed)) {
                notify("Antamasi käyttäjä on jo lisätty kutsuttavien listaan.", "info")
                setEmail("")
                return false
            } else if (invitedList.some(u => u.username === trimmed)) {
                notify("Antamasi käyttäjä on jo kutsuttu perheeseen.", "info")
                setEmail("")
                return false
            } else if (familyMembers.some(u => u.username === trimmed)) {
                notify("Antamasi käyttäjä kuuluu jo perheeseen.", "info")
                setEmail("")
                return false
            }
        } else {
            notify("Olet jo lisännyt maksimimäärän käyttäjiä!", "error")
            setEmail("")
            return false  
        }

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

    const toggleParent = async (idxOrUser, type) => {
        if (type === "invitation") {
            setFamilyMembersToInvite(prev => prev.map((user, i) =>
                i === idxOrUser ? { ...user, parent: !user.parent } : user
            ))
        } else if (type === "modify") {
            try {
                const { data } = await updateParent ({
                    variables: {
                        userId: idxOrUser.id,
                        parent: !idxOrUser.parent
                    }
                })
                setFamilyMembersList(prev => prev.map((user) =>
                    user.id === data?.updateParent?.id ? { ...user, parent: !user.parent } : user))
            } catch (err) {
                notify(`VIRHE: ${err}`, "error")
            }
        }
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
            await refetchInvited()
            setFamilyMembersToInvite([])
            setEmail('')
        } catch (err) {
            console.error(err)
            notify(err.message, 'error')
        }
    }

    const handleDelete = async (user) => {
        if (window.confirm(`Haluatko varmasti poistaa käyttäjän ${user.name} perheestäsi? TOIMINTOA EI VOI PERUUTTAA !!!`)) {
            try {
                const { data } = await deleteUser ({
                    variables: { id: user.id }
                })

                if (data) {
                    notify(`${data?.name || "Käyttäjä"} poistettu perheestä.`, "info")
                    setFamilyMembersList(prev => prev.filter(u => u.id !== user.id))
                }
            } catch (err) {
                notify(`VIRHE: ${err}`, "error")
            }
        }
    }

    const handleCancel = async (user) => {
        if (window.confirm(`Haluatko varmasti peruuttaa osoitteeseen ${user.username} lähetetyn kutsun`)) {
            try {
                const { data } = await cancelInvitation ({
                    variables: { id: user.id }
                })

                if (data) {
                    notify("Kutsu peruutettu.", "info")
                    setInvitedList(prev => prev.filter(u => u.id !== user.id))
                }
            } catch (err) {
                notify(`VIRHE: ${err}`, "error")
            }
        }
    }

    const openUser = (user) => {
        navigate(`/family/${user.id}`)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: '90vh', overflow: 'auto' }}
        >
            <div
                className="card shadow-lg p-4 align-items-center"
                onClick={e => e.stopPropagation()}
                style={{
                    padding: 10,
                    border: '1px solid black',
                    borderRadius: 20,
                    backgroundColor: 'white',
                    width: '80%'
                }}
            >
            {currentUser.parent ? (
            <>
                <h4 className="mb-5">Kutsu perheenjäsenesi Lifelinen käyttäjiksi!</h4>
                <span className="mb-4">Voit lähettää kutsun jopa 10:lle perheenjäsenelle!</span>
                <small className="mb-2" style={{border: '1px solid black', borderRadius: 10, padding: 10}}>Voit halutessasi antaa valituille perheenjäsenille
                    laajemmat parent-oikeudet jo kutsun lähettämisen yhteydessä. Vanhemmalla on esimerkiksi mahdollisuus muuttaa lapsijäsenien
                    ilmoitusasetuksia. Perheen perustajajäsen voi muokata parent-valtuuksia myöhemmin hallintapaneelin kautta.
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
                                    onChange={() => toggleParent(i, "invitation")}
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
                            disabled={!email && familyMembersToInvite.length === 0}
                        >
                            {familyMembersToInvite.length === 0 && !email ? "Lisää perheenjäsen" : "Lähetä kutsut"}
                        </button>
                    )}
                </div>

                <div className="row w-100 mt-5 text-start p-3">
                    {invitedList?.length > 0 && <div className="col-6 p-0">
                        <h5 className="mb-3">Lähetetyt kutsut:</h5>
                        {invitedList?.map(user => (
                            <div key={user?.username} className="row">
                                <div className="col-7">
                                    <b>{user?.username}</b>
                                    <br />
                                    <i>
                                        Voimassa:{" "}
                                        {user?.invitationTokenExpiry
                                        ? new Date(Number(user.invitationTokenExpiry)).toLocaleDateString()
                                        : "Ei asetettu"} saakka.
                                    </i>
                                </div>
                                <div className="col-3 align-self-center">
                                    <button
                                        className="btn btn-sm btn-danger"
                                        disabled={!currentUser.isOwner}
                                        onClick={() => handleCancel(user)}
                                    >
                                        Poista kutsu
                                    </button>
                                </div>
                            </div>
                            ))}
                    </div>}

                    <div className={invitedList?.length > 0 ? ("col-6 p-0 text-start") : ("col-12 p-0 text-center")}>
                        <h5 className="mb-3">Perheenjäsenet</h5>
                        <div className="row">
                            <div className={invitedList?.length > 0 ? ("col-5 text-start") : ("col-4 offset-1 text-center")}><small>Tarkastele klikkaamalla:</small></div>
                            <div className={invitedList?.length > 0 ? ("col-6 ms-3 text-start") : ("col-3 ms-4 text-center")}><small>Vanhempi:</small></div>
                        </div>
                        {familyMembersList?.map((user) => (
                            <div key={user.id} className="row mt-2">
                                <div className="col-6" style={{cursor: "pointer"}}>
                                    {!currentUser.owner && user.owner ? (
                                        <span onClick={() => openUser(user)} className={user.owner && !currentUser.isOwner ? "text-danger" : ""}>
                                            <b>{user.owner && !currentUser.isOwner ? (<b>Pääkäyttäjä {user.name}</b>) : (user.name.split(' ')[0])}</b>
                                        </span>
                                    ) : (
                                        !user.owner && <span onClick={() => openUser(user)}><b>{user.name.split(" ")[0]}</b></span>
                                    )}
                                </div>
                                <div className="col-2">
                                    <input
                                        className="me-3"
                                        type="checkbox"
                                        checked={user.parent}
                                        onChange={() => toggleParent(user, "modify")}
                                        disabled={user.owner || user.id === currentUser.id}
                                    />
                                </div>
                                <div className="col-2">
                                    <button
                                        className="btn btn-sm btn-danger"
                                        disabled={user.owner || user.id === currentUser.id}
                                        onClick={() => handleDelete(user)}
                                    >
                                        Poista
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
            ) : (
                <div className="w-100">
                    <h4 className="mb-4">Perheenjäsenet:</h4>
                    {familyMembers.map(u => 
                        <div className="row text-center" key={u.id} onClick={() => openUser(u)} style={{cursor: "pointer"}}>
                            <div className="col-4">
                                <span className={u.owner ? "text-danger" : u.parent ? "text-info" : ""}>{u.name}</span>
                            </div>
                            <div className="col-4">
                                {u.username}
                            </div>
                            <div className="col-4">
                                <span className={u.owner ? "text-danger" : u.parent ? "text-info" : ""}>{u.owner ? "Ylläpitäjä" : u.parent ? "Vanhempi" : "Lapsi"}</span>
                            </div>
                        </div>
                    )}
                </div>
                )}
            </div>
        </motion.div>
    )
}

export default Family