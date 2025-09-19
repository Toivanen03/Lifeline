import Invitation from "./cards/invitationCard"
import ShoppingList from "./cards/shoppinglist"
import Settings from "./cards/settings"
import Todos from "./cards/todos"
import Schedules from "./cards/schedules"
import Shifts from "./cards/shifts"
import Chores from "./cards/chores"
import Family from "./cards/family"
import { Route } from "react-router-dom"
import WeatherInfo from "./cards/weatherInfo"
import Forecast from "./cards/forecast"
import CalendarFull from "./cards/calendar"

const Cards = ({ notify, family, firstname }) => {

    return (
        <>
            <Route path="/invite" element={<Invitation notify={notify} />} />
            <Route path="/shoppinglist" element={<ShoppingList notify={notify} />} />
            <Route path="/settings" element={<Settings notify={notify} family={family} />} />
            <Route path="/todos" element={<Todos notify={notify} />} />
            <Route path="/schedules" element={<Schedules notify={notify} />} />
            <Route path="/shifts" element={<Shifts notify={notify} />} />
            <Route path="/chores" element={<Chores notify={notify} />} />
            <Route path="/family" element={<Family family={family} />} />
            <Route path="/weatherinfo" element={<WeatherInfo />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/calendar" element={<CalendarFull notify={notify} firstname={firstname} />} />
        </>
    )
}

export default Cards