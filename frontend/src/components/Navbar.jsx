import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { Menu, X, ChefHat } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, loading } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close admin panel when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsAdminPanelOpen(false);
    };

    if (isAdminPanelOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isAdminPanelOpen]);

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  };

  const getNavLinkClass = (pageName) => {
    // For admin pages, keep "Admin Panel" active
    if (pageName === "admin" && location.pathname.includes("/admin/")) {
      return "text-red-600 font-semibold transition";
    }

    // For regular pages
    if (pageName === "home" && location.pathname === "/home") {
      return "text-red-600 font-semibold transition";
    }
    if (pageName === "reservations" && location.pathname === "/reservations") {
      return "text-red-600 font-semibold transition";
    }
    if (
      pageName === "my-reservations" &&
      location.pathname === "/my-reservations"
    ) {
      return "text-red-600 font-semibold transition";
    }
    if (pageName === "profile" && location.pathname === "/profile") {
      return "text-red-600 font-semibold transition";
    }

    return "text-gray-700 hover:text-red-600 transition";
  };

  const handleMenuClick = (e, section) => {
    e.preventDefault();
    if (location.pathname !== "/home") {
      // If not on home page, navigate to home first then scroll
      window.location.href = `/home#${section}`;
    } else {
      // If already on home page, just scroll
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  };

  const handleAdminPanelClick = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling to document
    setIsAdminPanelOpen(!isAdminPanelOpen);
  };

  const handleAdminLinkClick = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling to document
    setIsAdminPanelOpen(false);
  };

  // Check if we're on home page and user is logged in (and not admin)
  const isHomePage = location.pathname === "/home";
  const showOrderButton = isHomePage && user && user.role !== "admin";

  return (
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
          <div className="hidden md:flex space-x-8 items-center">
            <a href="/home" className={getNavLinkClass("home")}>
              Home
            </a>

            {/* Menu and About links - work as anchors */}
            <button
              onClick={(e) => handleMenuClick(e, "menu")}
              className="text-gray-700 hover:text-red-600 transition"
            >
              Menu
            </button>
            <button
              onClick={(e) => handleMenuClick(e, "about")}
              className="text-gray-700 hover:text-red-600 transition"
            >
              About
            </button>

            {/* Regular user links */}
            {user && user.role !== "admin" && (
              <>
                <a
                  href="/reservations"
                  className={getNavLinkClass("reservations")}
                >
                  Make Reservation
                </a>
                <a
                  href="/my-reservations"
                  className={getNavLinkClass("my-reservations")}
                >
                  My Reservations
                </a>
              </>
            )}

            {/* Admin Panel Dropdown */}
            {user && user.role === "admin" && (
              <div className="relative">
                <button
                  onClick={handleAdminPanelClick}
                  className={`flex items-center space-x-1 ${getNavLinkClass(
                    "admin"
                  )}`}
                >
                  <span>Admin Panel</span>
                </button>

                {isAdminPanelOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                  >
                    <a
                      href="/admin/reservations"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition"
                      onClick={handleAdminLinkClick}
                    >
                      All Reservations
                    </a>
                    <a
                      href="/admin/menu"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition"
                      onClick={handleAdminLinkClick}
                    >
                      Menu Management
                    </a>


                    <a
                    href="/admin/restaurantFeedbacks"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition"
                    onClick={handleAdminLinkClick}
                  >
                    View All Feedbacks
                  </a>


                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth Buttons */}
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
                  Register
                </a>
              </>
            ) : (
              <>
                {/* Start Ordering Button - Only show on home page for non-admin users */}
                {showOrderButton && (
                  <button
                    onClick={() => navigate(`/order`)}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition font-medium"
                  >
                    Start Ordering
                  </button>
                )}

                <a href="/profile" className={getNavLinkClass("profile")}>
                  Profile
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
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <a href="/home" className={`block py-2 ${getNavLinkClass("home")}`}>
              Home
            </a>

            {/* Menu and About links - Mobile */}
            <button
              onClick={(e) => handleMenuClick(e, "menu")}
              className="block w-full text-left py-2 text-gray-700 hover:text-red-600 transition"
            >
              Menu
            </button>
            <button
              onClick={(e) => handleMenuClick(e, "about")}
              className="block w-full text-left py-2 text-gray-700 hover:text-red-600 transition"
            >
              About
            </button>

            {/* Regular user links - Mobile */}
            {user && user.role !== "admin" && (
              <>
                <a
                  href="/reservations"
                  className={`block py-2 ${getNavLinkClass("reservations")}`}
                >
                  Make Reservation
                </a>
                <a
                  href="/my-reservations"
                  className={`block py-2 ${getNavLinkClass("my-reservations")}`}
                >
                  My Reservations
                </a>
              </>
            )}

            {/* Admin Panel - Mobile */}
            {user && user.role === "admin" && (
              <>
                <div className="text-gray-700 font-semibold py-2 border-t mt-2 pt-2">
                  Admin Panel
                </div>
                <a
                  href="/admin/reservations"
                  className={`block py-2 pl-4 ${getNavLinkClass("admin")}`}
                >
                  All Reservations
                </a>
                <a
                  href="/admin/menu"
                  className={`block py-2 pl-4 ${getNavLinkClass("admin")}`}
                >
                  Menu Management
                </a>
              </>
            )}

            {/* Auth Section - Mobile */}
            <div className="border-t mt-2 pt-2">
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
                    className="block w-full bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition mt-2 text-center"
                  >
                    Register
                  </a>
                </>
              ) : (
                <>
                  {/* Start Ordering Button - Mobile - Only show on home page for non-admin users */}
                  {showOrderButton && (
                    <button
                      onClick={() => Navigate(`/order`)}
                      className="block w-full bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition mt-2 text-center font-medium"
                    >
                      Start Ordering
                    </button>
                  )}

                  <a
                    href="/profile"
                    className={`block py-2 ${getNavLinkClass("profile")}`}
                  >
                    Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full bg-gray-200 py-2 rounded-full mt-2 hover:bg-gray-300 transition text-left px-4"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
