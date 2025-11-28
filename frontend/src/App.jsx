import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminMenuPage from "./pages/AdminMenuPage";
import RestaurantHomepage from "./pages/HomePage";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import OrderPage from "./pages/OrderPage";
import ReservationPage from "./pages/ReservationPage";
import MyReservations from "./pages/MyReservationsPage";
import AdminReservation from "./pages/AdminReservation";
import AdminDashboard from "./pages/AdminDashboard";

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
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

      </Routes>
    </>
  );
}

export default App;
