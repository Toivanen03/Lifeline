import { motion } from "framer-motion"
import { useContext, useState } from "react"
import { useParams } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import { ADD_BIRTHDAY } from "../../schema/queries"
import { useMutation } from "@apollo/client/react"

const FamilyMember = ({ notify, familyMembers }) => {
    const {id} = useParams()
    const [familyMember] = useState(familyMembers.find(u => u.id === id))
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
                style={{padding: 20, border: 'solid 1px black', borderRadius: 20, backgroundColor: 'white', width: '60vw'}}
                >
                    <div className="w-100">
                        <h3 className="mb-3">{familyMember.name}</h3>
                        <div className="row align-items-center mb-3">
                            <div className="col-4 offset-3 text-start">
                                <span>Käyttäjätunnus:</span>
                            </div>
                            <div className="col-4 text-start">
                                <span>{familyMember.username}</span>
                            </div>
                        </div>
                        <div className="row align-items-center mb-3">
                            <div className="col-4 offset-3 text-start">
                                <span>Pääkäyttäjä:</span>
                            </div>
                            <div className="col-4 text-start">
                                <span>{familyMember.owner ? "Kyllä" : "Ei"}</span>
                            </div>
                        </div>
                        <div className="row align-items-center mb-3">
                            <div className="col-4 offset-3 text-start">
                                <span>Vanhempi:</span>
                            </div>
                            <div className="col-4 text-start">
                                <span>{familyMember.parent ? "Kyllä" : "Ei"}</span>
                            </div>
                        </div>
                        <div className="row align-items-center">
                            <div className="col-4 offset-3 text-start">
                                <span>Syntymäaika:</span>
                            </div>
                            <div className="col-3 text-start">
                                {!familyMember.birthday || currentUser.isOwner ? (<input
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
                            <div className="col-1">
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