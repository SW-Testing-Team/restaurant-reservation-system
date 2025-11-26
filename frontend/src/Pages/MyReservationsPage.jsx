import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Calendar, Clock, Users, Phone, MapPin, Trash2, Edit2, Menu, X, ChefHat, Check, X as CloseIcon } from "lucide-react";

const MyReservations = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingReservation, setEditingReservation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: "",
    time: "",
    guests: 2,
    phoneNumber: ""
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  };

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  // Check availability when date/time changes in edit mode
  useEffect(() => {
    if (editingReservation && editFormData.date && editFormData.time) {
      checkAvailability();
    }
  }, [editFormData.date, editFormData.time]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reservations/my-reservations`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      } else {
        setMessage("Failed to load reservations");
      }
    } catch (error) {
      setMessage("Error loading reservations");
      console.error("Reservations fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

const checkAvailability = async () => {
  setCheckingAvailability(true);
  try {
    const response = await fetch(
      `${API_URL}/reservations/available-for-update/${editingReservation}?date=${editFormData.date}&time=${editFormData.time}`
    );
    if (response.ok) {
      const tables = await response.json();
      setAvailableTables(tables);
    }
  } catch (error) {
    console.error("Error checking availability:", error);
    setAvailableTables([]);
  } finally {
    setCheckingAvailability(false);
  }
};

  const cancelReservation = async (reservationId) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });

      if (response.ok) {
        setMessage("Reservation cancelled successfully");
        setReservations(reservations.filter(res => res._id !== reservationId));
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to cancel reservation");
      }
    } catch (error) {
      setMessage("Error cancelling reservation");
      console.error("Cancel error:", error);
    }
  };

  const startEdit = (reservation) => {
    setEditingReservation(reservation._id);
    setEditFormData({
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      phoneNumber: reservation.phoneNumber || ""
    });
    setAvailableTables([]);
  };

  const cancelEdit = () => {
    setEditingReservation(null);
    setEditFormData({ date: "", time: "", guests: 2, phoneNumber: "" });
    setAvailableTables([]);
  };

  const updateReservation = async (reservationId) => {
    // Check if date/time changed and if tables are available
    if ((editFormData.date || editFormData.time) && availableTables.length === 0) {
      setMessage("No tables available for the selected date and time");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        setMessage("Reservation updated successfully");
        // Refresh the reservations list
        fetchReservations();
        setEditingReservation(null);
        setAvailableTables([]);
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to update reservation");
      }
    } catch (error) {
      setMessage("Error updating reservation");
      console.error("Update error:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (date, time) => {
    const reservationDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (reservationDateTime < now) {
      return "bg-gray-100 text-gray-600";
    }
    return "bg-green-50 text-green-800";
  };

  const getStatusText = (date, time) => {
    const reservationDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (reservationDateTime < now) {
      return "Completed";
    }
    return "Confirmed";
  };

  const isDateTimeChanged = (reservation) => {
    return editFormData.date !== reservation.date || editFormData.time !== reservation.time;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your reservations.</p>
          <a
            href="/login"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition inline-block"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

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
                href="/"
                className="text-gray-700 hover:text-red-600 transition"
              >
                Home
              </a>
              <a
                href="/reservations"
                className="text-gray-700 hover:text-red-600 transition"
              >
                Make Reservation
              </a>
              <a
                href="/my-reservations"
                className="text-red-600 font-semibold transition"
              >
                My Reservations
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 px-6 py-2 rounded-full hover:bg-gray-300 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
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
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a
                href="/"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Home
              </a>
              <a
                href="/reservations"
                className="block py-2 text-gray-700 hover:text-red-600"
              >
                Make Reservation
              </a>
              <a
                href="/my-reservations"
                className="block py-2 text-red-600 font-semibold"
              >
                My Reservations
              </a>
              
              {user ? (
                <>
                  <div className="block py-2 text-gray-700 border-t mt-2 pt-2">
                    Welcome, {user.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full bg-gray-200 py-2 rounded-full mt-2 hover:bg-gray-300 transition text-left px-4"
                  >
                    Logout
                  </button>
                </>
              ) : (
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
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header - Properly Centered */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              My Reservations
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Manage your upcoming visits to Bella Vista
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-8 p-4 rounded-lg text-center ${
              message.includes("successfully") 
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message}
            </div>
          )}

          {/* Reservations List */}
          <div className="space-y-6">
            {reservations.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Reservations Yet</h3>
                <p className="text-gray-600 mb-8 text-lg">You haven't made any reservations yet.</p>
                <a
                  href="/reservations"
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition inline-block text-lg"
                >
                  Make Your First Reservation
                </a>
              </div>
            ) : (
              reservations.map((reservation) => (
                <div
                  key={reservation._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      {/* Reservation Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
                            Reservation #{reservation._id.slice(-6).toUpperCase()}
                          </h3>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(reservation.date, reservation.time)}`}>
                            {getStatusText(reservation.date, reservation.time)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Date & Time */}
                          <div className="flex items-start space-x-4">
                            <div className="bg-red-100 p-3 rounded-xl">
                              <Calendar className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 font-medium mb-1">Date & Time</p>
                              {editingReservation === reservation._id ? (
                                <div className="space-y-2">
                                  <input
                                    type="date"
                                    value={editFormData.date}
                                    onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    min={new Date().toISOString().split('T')[0]}
                                  />
                                  <select
                                    value={editFormData.time}
                                    onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  >
                                    <option value="">Select time</option>
                                    <option value="17:00">5:00 PM</option>
                                    <option value="18:00">6:00 PM</option>
                                    <option value="19:00">7:00 PM</option>
                                    <option value="20:00">8:00 PM</option>
                                    <option value="21:00">9:00 PM</option>
                                  </select>
                                  {/* Availability Check */}
                                  {isDateTimeChanged(reservation) && editFormData.date && editFormData.time && (
                                    <div className={`p-2 rounded-lg text-sm ${
                                      checkingAvailability 
                                        ? "bg-blue-50 text-blue-800" 
                                        : availableTables.length > 0 
                                          ? "bg-green-50 text-green-800" 
                                          : "bg-red-50 text-red-800"
                                    }`}>
                                      {checkingAvailability ? (
                                        <div className="flex items-center space-x-2">
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                          <span>Checking availability...</span>
                                        </div>
                                      ) : availableTables.length > 0 ? (
                                        <div className="flex items-center space-x-2">
                                          <Check className="h-4 w-4" />
                                          <span>{availableTables.length} tables available</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-2">
                                          <CloseIcon className="h-4 w-4" />
                                          <span>No tables available</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <p className="font-semibold text-gray-800 text-lg">
                                    {formatDate(reservation.date)}
                                  </p>
                                  <p className="text-gray-600">
                                    at {reservation.time}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Table & Guests */}
                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium mb-1">Table & Guests</p>
                              {editingReservation === reservation._id ? (
                                <select
                                  value={editFormData.guests}
                                  onChange={(e) => setEditFormData({...editFormData, guests: parseInt(e.target.value)})}
                                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                    <option key={num} value={num}>{num} guests</option>
                                  ))}
                                </select>
                              ) : (
                                <p className="font-semibold text-gray-800 text-lg">
                                  Table {reservation.tableNumber} • {reservation.guests} guests
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Contact */}
                          <div className="flex items-start space-x-4">
                            <div className="bg-green-100 p-3 rounded-xl">
                              <Phone className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium mb-1">Contact</p>
                              {editingReservation === reservation._id ? (
                                <input
                                  type="tel"
                                  value={editFormData.phoneNumber}
                                  onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  placeholder="01012345678"
                                />
                              ) : (
                                <p className="font-semibold text-gray-800 text-lg">
                                  {reservation.phoneNumber || "Not provided"}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Restaurant Info */}
                          <div className="flex items-start space-x-4">
                            <div className="bg-purple-100 p-3 rounded-xl">
                              <MapPin className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium mb-1">Location</p>
                              <p className="font-semibold text-gray-800 text-lg">
                                Bella Vista Restaurant
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 mt-6 lg:mt-0 lg:ml-6">
                        {editingReservation === reservation._id ? (
                          <>
                            <button
                              onClick={() => updateReservation(reservation._id)}
                              disabled={isDateTimeChanged(reservation) && availableTables.length === 0}
                              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="h-4 w-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                            >
                              <CloseIcon className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(reservation)}
                              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span>Update</span>
                            </button>
                            <button
                              onClick={() => cancelReservation(reservation._id)}
                              className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          {reservations.length > 0 && (
            <div className="mt-12 text-center">
              <a
                href="/reservations"
                className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition inline-block text-lg"
              >
                Make Another Reservation
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReservations;