import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { useMutation, useQuery } from '@apollo/client/react'
import { DELETE_FAMILY, ME, FAMILY } from "../../schema/queries"
import { AuthContext } from '../../contexts/AuthContext'

const UserSettings = ({ notify }) => {
  const { logout } = useContext(AuthContext)
  const [deleteFamily] = useMutation(DELETE_FAMILY, {
    onCompleted: () => {
      logout()
      notify(`Perhe ${familyData?.family?.name} poistettu onnistuneesti.`, "info")
      localStorage.clear()
      navigate('/')
    },
    onError: (err) => {
      notify(err.message, "error")
    }
  })
  const { data: meData } = useQuery(ME)
  const { data: familyData } = useQuery(FAMILY)
  const navigate = useNavigate()
  const familyId = familyData?.family?.familyId
  const owner = meData?.me?.id === familyData?.family?.owner?.id

  const handleFamilyDelete = () => {
    if (!familyId) {
      notify("Perheen ID:tä ei löydy.", "error")
      return
    }
    if (!owner) console.error("Vain omistajalla on oikeus poistaa perhe!")
    if (window.confirm("TOIMINTOA EI VOI PERUUTTAA! Oletko varma?") && owner) {
      deleteFamily({ variables: { familyId: familyId } })
    }
  }

  return (
    <div className="row">
      <div className="col-6">
        <button className="btn btn-primary" onClick={() => navigate('/reset-password')}>Vaihda salasana</button>
      </div>

      {owner && <div className="col-6">
        <button className="btn btn-danger" onClick={handleFamilyDelete}>Poista käyttäjätili</button>
        <div className="row mt-2">
          <small className="text-danger">VAROITUS:</small>
          <small className="text-danger">Päätilin poistaminen poistaa perheen tiedot <u>pysyvästi</u>!</small>
          <small className="text-danger">Toimintoa ei voi peruuttaa.</small>
        </div>
      </div>}
    </div>
  )
}

export default UserSettings