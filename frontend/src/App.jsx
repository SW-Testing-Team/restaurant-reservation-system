import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import RestaurantHomepage from "./Pages/HomePage";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import OrderPage from "./Pages/OrderPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<RestaurantHomepage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
