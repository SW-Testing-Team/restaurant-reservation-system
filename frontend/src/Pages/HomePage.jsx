import { useState, useEffect, useContext } from "react";
import { Menu, X, ChefHat, Clock, MapPin, Phone } from "lucide-react";
import { AuthContext } from "../context/authContext";

import axios from "axios";

function Homepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useContext(AuthContext);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    window.location.reload(); // refresh state
  };

  const [menu, setMenu] = useState([]); // state to hold menu data
  const [error, setError] = useState(null); // state for errors

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("http://localhost:3000/menu");
        setMenu(response.data); // store menu in state

        console.log("user data:", user);
      } catch (err) {
        setError(err);
      } finally {
      }
    };

    fetchMenu();
  }, []); // empty dependency array → runs once on mount

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p>Error fetching menu: {error.message}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold text-gray-800">
                Bella Vista
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a
                href="#home"
                className="text-gray-700 hover:text-red-600 transition"
              >
                Home
              </a>
              <a
                href="#menu"
                className="text-gray-700 hover:text-red-600 transition"
              >
                Menu
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-red-600 transition"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-red-600 transition"
              >
                Contact
              </a>
            </div>

            {/* <div className="hidden md:flex items-center space-x-4">
              <a
                href="/login"
                className="text-gray-700 hover:text-red-600 transition font-medium"
              >
                Login
              </a>
              <a
                href="/register"
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
              >
                Sign Up
              </a>
            </div> */}

            {/* AUTH BUTTONS */}
            <div className="hidden md:flex items-center space-x-4">
              {!loading && !user ? (
                <>
                  <a
                    href="/login"
                    className="text-gray-700 hover:text-red-600 transition font-medium"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
                  >
                    Sign Up
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/profile"
                    className="text-gray-700 hover:text-red-600 transition font-medium"
                  >
                    {"Profile"}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 px-6 py-2 rounded-full hover:bg-gray-300 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {/* {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a
                href="#home"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Home
              </a>
              <a
                href="#menu"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Menu
              </a>
              <a
                href="#about"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                About
              </a>
              <a
                href="#contact"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Contact
              </a>
              <a
                href="/login"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Login
              </a>
              <a
                href="/register"
                className="block w-full bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition mt-2 text-center"
              >
                Sign Up
              </a>
            </div>
          </div>
        )} */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a
                href="#home"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Home
              </a>
              <a
                href="#menu"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Menu
              </a>
              <a
                href="#about"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                About
              </a>
              <a
                href="#contact"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Contact
              </a>

              {!loading && !user ? (
                <>
                  <a
                    href="/login"
                    className="block py-2 text-gray-700 hover:text-red-600"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="block bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition mt-2 text-center"
                  >
                    Sign Up
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/profile"
                    className="block py-2 text-gray-700 hover:text-red-600"
                  >
                    {user?.name || "Profile"}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full bg-gray-200 py-2 rounded-full mt-2 hover:bg-gray-300 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

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
                            {item.price}$
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
          <button className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition">
            Make a Reservation
          </button>
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
