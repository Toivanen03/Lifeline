import { useNavigate } from "react-router-dom"

const UserSettings = () => {
    const navigate = useNavigate()

  return (
    <div>
        <button className="btn btn-primary" onClick={() => navigate('/reset-password')}>Vaihda salasana</button>
    </div>
  )
}

export default UserSettings