import Family from "./cards/familyCard"
import ShoppingList from "./cards/shoppinglist"
import Settings from "./cards/settings"
import Todos from "./cards/todos"
import Schedules from "./cards/schedules"
import Shifts from "./cards/shifts"
import Chores from "./cards/chores"
import NotificationSettings from "./cards/notification-settings"
import { Route } from "react-router-dom"
import WeatherInfo from "./cards/weatherInfo"
import Forecast from "./cards/forecast"
import CalendarFull from "./cards/calendar"
import MealMenus from "./cards/mealmenus"
import FamilyMember from "./cards/familyMember"

const Cards = ({ notify, familyMembers }) => {

    return (
        <>
            <Route path="/family" element={<Family notify={notify} familyMembers={familyMembers} />} />
            <Route path="/family/:id" element={<FamilyMember notify={notify} familyMembers={familyMembers} />} />
            <Route path="/shoppinglist" element={<ShoppingList notify={notify} />} />
            <Route path="/mealmenus" element={<MealMenus notify={notify} />} />
            <Route path="/settings" element={<Settings notify={notify} />} />
            <Route path="/todos" element={<Todos notify={notify} />} />
            <Route path="/schedules" element={<Schedules notify={notify} familyMembers={familyMembers} />} />
            <Route path="/shifts" element={<Shifts notify={notify} />} />
            <Route path="/chores" element={<Chores notify={notify} />} />
            <Route path="/notification-settings" element={<NotificationSettings familyMembers={familyMembers} />} />
            <Route path="/weatherinfo" element={<WeatherInfo />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/calendar" element={<CalendarFull notify={notify} familyMembers={familyMembers} />} />
        </>
    )
}

export default Cards