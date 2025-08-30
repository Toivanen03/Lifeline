import { useMutation } from "@apollo/client/react"
import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { VERIFY_EMAIL_OR_INVITE } from "../schema/queries"

const EmailVerify = ({ notify }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [verifyEmailOrInvite] = useMutation(VERIFY_EMAIL_OR_INVITE)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get("token")
    const familyId = params.get("familyId")

    if (!token) {
      notify("Virheellinen linkki", "error")
      return
    }

    verifyEmailOrInvite({ variables: { token, familyId } })
      .then(({ data }) => {
        const user = data.verifyEmailOrInvite

        if (familyId) {
          notify(
          <div>
            Sinut on liitetty perheeseen ja sähköpostiosoitteesi on vahvistettu.<br /><br />
            Voit ottaa Lifelinen käyttöösi. Jos et ole vielä ladannut Lifelineä,
            lataa sovellus Play-kaupasta. Sovellus on valmiina käyttöön kirjauduttuasi sovelluksessa.
          </div>, "success")
          return
        } else {
          notify("Sähköpostisi on vahvistettu!", "success")
          navigate("/")
        }
      })
      .catch(() => {
        notify("Linkki on virheellinen tai vanhentunut", "error")
      })
  }, [location, navigate, notify, verifyEmailOrInvite])

  return <div>Vahvistetaan...</div>
}

export default EmailVerify