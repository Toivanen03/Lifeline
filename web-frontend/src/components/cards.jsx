import Invitation from "./cards/invitationCard"
import ShoppingList from "./cards/shoppinglist"
import Settings from "./cards/settings"
import Todos from "./cards/todos"
import Schedules from "./cards/schedules"
import Shifts from "./cards/shifts"
import Chores from "./cards/chores"
import { Route } from "react-router-dom"

const Cards = ({ notify }) => {

    return (
        <>
            <Route path="/invite" element={<Invitation notify={notify} />} />
            <Route path="/shoppinglist" element={<ShoppingList notify={notify} />} />
            <Route path="/settings" element={<Settings notify={notify} />} />
            <Route path="/todos" element={<Todos notify={notify} />} />
            <Route path="/schedules" element={<Schedules notify={notify} />} />
            <Route path="/shifts" element={<Shifts notify={notify} />} />
            <Route path="/chores" element={<Chores notify={notify} />} />
        </>
    )
}

export default Cards