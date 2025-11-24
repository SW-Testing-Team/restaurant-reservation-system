import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import RestaurantHomepage from "./Pages/HomePage";
import Register from "./Pages/Register";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RestaurantHomepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
