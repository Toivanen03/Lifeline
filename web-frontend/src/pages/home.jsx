import { useNavigate, Outlet } from "react-router-dom"
import { useState } from "react"
import SidePanel from "../components/sidePanel"
import WidgetPanel from "../components/widgetPanel"

const Home = ({ family, notify }) => {
  const [mouseDownInsideCard, setMouseDownInsideCard] = useState(false)

  const navigate = useNavigate()

  const showCard = (panel) => {
    navigate(panel)
  }

    const handleMouseDown = (e) => {
    if (e.target.closest('.card')) {
      setMouseDownInsideCard(true)
    } else {
      setMouseDownInsideCard(false)
    }
  }

  const handleMouseUp = () => {
    if (!mouseDownInsideCard) {
      showCard('/')
    }
    setMouseDownInsideCard(false)
  }

  return (
    <div className="row h-100 mt-3 overflow-hidden">
      <div className="col-1 align-items-center sidepanel">
        <SidePanel family={family} showCard={showCard} />
      </div>

      <div className="col-9"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
      >
        <Outlet />
      </div>

      <div className="col-2">
        <WidgetPanel family={family} notify={notify} />
      </div>
    </div>
  )
}

export default Home