import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { useMutation, useQuery } from '@apollo/client/react'
import { DELETE_FAMILY, FAMILY } from "../../schema/queries"
import { AuthContext } from '../../contexts/AuthContext'

const UserSettings = ({ notify }) => {
  const { logout, currentUser, isOwner } = useContext(AuthContext)
  const [deleteFamily] = useMutation(DELETE_FAMILY, {
    onCompleted: () => {
      notify(`Perhe ${familyData?.family?.name} poistettu onnistuneesti.`, "info")
      localStorage.clear()
      logout()
    },
    onError: (err) => {
      notify(err.message, "error")
    }
  })

  const { data: familyData } = useQuery(FAMILY)
  const navigate = useNavigate()
  const familyId = familyData?.family?.familyId

  const handleFamilyDelete = () => {
    if (!familyId) {
      notify("Perheen ID:tä ei löydy.", "error")
      return
    }
    if (!currentUser.isOwner) console.error("Vain omistajalla on oikeus poistaa perhe!")
    if (window.confirm("TOIMINTOA EI VOI PERUUTTAA! Oletko varma?") && currentUser.isOwner) {
      deleteFamily({ variables: { familyId: familyId } })
    }
  }

  return (
    <div className="row w-100 mt-2">
      <div className="col-4">
        {currentUser.parent &&
        <>
          <button className="btn btn-primary mb-3" onClick={() => navigate('/notification-settings')}>
            Mobiili-ilmoitukset
          </button>
          <div className="row mt-2">
            <small>Asetusten muuttaminen</small>
            <small>muuttaa myös selaimen</small>
            <small>ilmoitusasetuksia.</small>
          </div>
        </>}
      </div>

      <div className="col-4">
        <button className="btn btn-primary" onClick={() => navigate('/reset-password')}>Vaihda salasana</button>
      </div>

      {currentUser.isOwner && <div className="col-3">
        <button className="btn btn-danger" onClick={handleFamilyDelete}>Poista käyttäjätili</button>
        <div className="row mt-2">
          <small className="text-danger">VAROITUS:</small>
          <small className="text-danger">Päätilin poistaminen poistaa <u>koko perheen tiedot pysyvästi</u>!</small>
          <small className="text-danger">Toimintoa ei voi peruuttaa.</small>
        </div>
      </div>}
    </div>
  )
}

export default UserSettings