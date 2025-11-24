import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import RestaurantHomepage from "./Pages/HomePage";
import Register from "./Pages/Register";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<RestaurantHomepage />} />
      </Routes>
    </>
  );
}

export default App;
