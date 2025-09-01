import { useNavigate, Outlet } from "react-router-dom"
import { useState } from "react"
import SidePanel from "../components/sidePanel"
import WidgetPanel from "../components/widgetPanel"

const Home = ({ family }) => {
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
    <div className="row flex-grow-1 overflow-hidden">
      <div className="col-1 d-flex flex-column p-3 h-100 overflow-hidden align-items-center">
        <SidePanel family={family} showCard={showCard} />
      </div>

      <div className="col-9 p-5 d-flex flex-column h-100 overflow-auto"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
      >
        <Outlet />
      </div>

      <div className="col-2 d-flex flex-column p-3 h-100 overflow-hidden">
        <WidgetPanel family={family} />
      </div>
    </div>
  )
}

export default Home