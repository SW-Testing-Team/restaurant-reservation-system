import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Clock, MapPin, Phone, ChefHat } from "lucide-react";

function Homepage() {
  const { user, loading } = useContext(AuthContext);
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("http://localhost:3000/menu");
        setMenu(response.data);
      } catch (err) {
        setError(err);
      }
    };

    fetchMenu();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-xl">Error fetching menu: {error.message}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="home" />
      
      {/* Hero Section */}
      <section
        id="home"
        className="pt-16 bg-gradient-to-r from-red-600 to-orange-500 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Welcome to Bella Vista
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Experience authentic Italian cuisine
          </p>
          <a href="#menu">
            <button className="bg-white text-red-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition">
              View Menu
            </button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Clock className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Open Daily</h3>
              <p className="text-gray-600">11:00 AM - 10:00 PM</p>
            </div>
            <div className="text-center">
              <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="text-gray-600">123 Main Street, Downtown</p>
            </div>
            <div className="text-center">
              <Phone className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">(555) 123-4567</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Menu</h2>

          <div className="space-y-12">
            {menu.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-2xl font-bold text-red-600 mb-6 border-b-2 border-red-600 pb-2">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {item.name}
                          </h4>
                          <span className="text-red-600 font-bold">
                            ${item.price}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">About Us</h2>
              <p className="text-gray-600 mb-4">
                For over 20 years, Bella Vista has been serving authentic
                Italian cuisine made with the finest ingredients. Our chefs
                bring traditional recipes from Italy to your table.
              </p>
              <p className="text-gray-600">
                We believe in creating memorable dining experiences through
                exceptional food, warm hospitality, and a welcoming atmosphere.
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-lg h-64 flex items-center justify-center">
              <ChefHat className="h-32 w-32 text-red-600 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Visit Us Today</h2>
          <p className="text-xl mb-8">Experience the taste of Italy</p>
          <a href="/reservations">
            <button className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition">
              Make a Reservation
            </button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Bella Vista Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;