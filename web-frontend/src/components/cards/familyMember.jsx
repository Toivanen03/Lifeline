import { motion } from "framer-motion"
import { useContext, useState } from "react"
import { useParams } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import { ADD_BIRTHDAY, UPDATE_PARENT } from "../../schema/queries"
import { useMutation } from "@apollo/client/react"

const FamilyMember = ({ notify, familyMembers }) => {
    const [updateParent] = useMutation(UPDATE_PARENT)
    const {id} = useParams()
    const [familyMember, setFamilyMember] = useState(familyMembers.find(u => u.id === id))
    const [birthday, setBirthday] = useState(formatDate(Number(familyMember.birthday)) || "")
    const { currentUser } = useContext(AuthContext)
    const [updateBirthday] = useMutation(ADD_BIRTHDAY)

    function formatDate(raw) {
        if (!raw) return ""
        const date = new Date(raw)
        if (isNaN(date)) return ""
        return date.toISOString().split("T")[0]
    }

    const handleAddBirthday = async () => {
        try {
            const { data } = await updateBirthday({
                variables: {
                    userId: id,
                    birthday: birthday
                }
            })

            const dateString = new Date(data.updateBirthday.birthday)

            if (data) {
                setBirthday(Number(dateString))
                notify("Syntymäpäivä lisätty!", "success")
                return
            }
        } catch (err) {
            notify(`VIRHE: ${err}`, "error")
        }
    }

    const calculateAge = (birthday) => {
        if (!birthday) return <span>-</span>
        const birthDate = new Date(birthday)
        const today = new Date()

        let years = today.getFullYear() - birthDate.getFullYear()
        let months = today.getMonth() - birthDate.getMonth()
        let days = today.getDate() - birthDate.getDate()

        if (days < 0) {
            months--
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
            days += prevMonth.getDate()
        }

        if (months < 0) {
            years--
            months += 12
        }

        return <span>{`${years} ${(years === 1) ? "vuosi" : "vuotta"}, ${months} ${(months === 1) ? "Kuukausi" : "kuukautta"}, ${days} ${(days === 1) ? "päivä." : "päivää."}`}</span>
    }

    const toggleParent = async (user) => {
        try {
            const { data } = await updateParent ({
                variables: {
                    userId: user.id,
                    parent: !user.parent
                }
            })

            if (data?.updateParent) {
                setFamilyMember(data.updateParent)
            }
        } catch (err) {
            notify(`VIRHE: ${err}`, "error")
        }
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
                style={{padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white', width: '65vw'}}
                >
                    <div className="w-100">
                        <div className="row mb-4">
                            <h3>{familyMember.name}</h3>
                            <span style={{color: 'blue'}}>Ikä: {calculateAge(birthday)}</span>
                            
                        </div>
                        <div className="row align-items-center mb-3">
                            <div className="col-3 offset-1 text-start">
                                <span>Käyttäjätunnus:</span>
                            </div>
                            <div className="col-3 text-start">
                                <span>{familyMember.username}</span>
                            </div>
                        </div>
                        <div className="row align-items-center mb-3">
                            <div className="col-3 offset-1 text-start">
                                <span>Pääkäyttäjä:</span>
                            </div>
                            <div className="col-3 text-start">
                                <span>{familyMember.owner ? "Kyllä" : "Ei"}</span>
                            </div>
                        </div>
                        <div className="row align-items-center mb-3">
                            <div className="col-3 offset-1 text-start">
                                <span>Vanhempi:</span>
                            </div>
                            <div className="col-3 text-start">
                                <span>{familyMember.parent ? "Kyllä" : "Ei"}</span>
                            </div>
                            {familyMember.parent && <div className="col-2 text-center offset-1 form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={familyMember.parent}
                                    onChange={() => toggleParent(familyMember)}
                                    disabled={familyMember.owner}
                                />
                            </div>}
                        </div>
                        <div className="row align-items-center mb-3">
                            <div className="col-3 offset-1 text-start">
                                <span>Syntymäaika:</span>
                            </div>
                            <div className="col-3 text-start">
                                {!familyMember.birthday || currentUser.isOwner ? (
                                <input
                                    id="birthday"
                                    type="date"
                                    placeholder={familyMember.birthday ? familyMember.birthday : birthday}
                                    value={birthday}
                                    onChange={({ target }) => setBirthday(target.value)}
                                    className="form-control rounded"
                                    disabled={familyMember.birthday && !currentUser.isOwner}
                                />
                                ) : (
                                    <span>{new Date(formatDate(Number(familyMember.birthday))).toLocaleDateString()}</span>
                                )}
                            </div>
                            <div className="col-2 text-center ms-3">
                                {(!familyMember.birthday && currentUser.parent) || currentUser.isOwner &&
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleAddBirthday()}
                                >
                                    {!familyMember.birthday ? "Lisää" : "Muokkaa"}
                                </button>}
                            </div>
                        </div>
                    </div>
            </div>
        </motion.div>
    )
}

export default FamilyMember