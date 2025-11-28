import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import AdminMenuPage from "./Pages/AdminMenuPage";
import RestaurantHomepage from "./Pages/HomePage";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import OrderPage from "./Pages/OrderPage";
import ReservationPage from "./Pages/ReservationPage";
import MyReservations from "./Pages/MyReservationsPage";
import AdminReservation from "./Pages/AdminReservation";
import AdminRestaurantFeedbacks from "./Pages/AdminRestaurantFeedbacks";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<RestaurantHomepage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path= "/admin/reservations" element={<AdminReservation />} />
        <Route path="/admin/restaurantFeedbacks" element={<AdminRestaurantFeedbacks />} />

      </Routes>
    </>
  );
}

export default App;
