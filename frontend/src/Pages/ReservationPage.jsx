import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Calendar, Clock, Users, Phone } from "lucide-react";
import Navbar from "../components/Navbar";
import { API_URL } from "../config/api";

const ReservationPage = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: 2,
    phoneNumber: user?.phone || "",
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Set user's phone number if available
  useEffect(() => {
    if (user?.phone) {
      setFormData((prev) => ({ ...prev, phoneNumber: user.phone }));
    }
  }, [user]);

  // Check availability when date/time changes
  useEffect(() => {
    if (formData.date && formData.time) {
      checkAvailability();
    }
  }, [formData.date, formData.time]);

  const checkAvailability = async () => {
    try {
      const response = await fetch(
        `${API_URL}/reservations/available?date=${formData.date}&time=${formData.time}`
      );
      if (response.ok) {
        const tables = await response.json();
        setAvailableTables(tables);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please login to make a reservation");
      return;
    }

    if (availableTables.length === 0) {
      setMessage("No tables available for the selected date and time");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to My Reservations page after successful reservation
        window.location.href = "/my-reservations";
      } else {
        setMessage(data.message || "Failed to create reservation");
      }
    } catch (error) {
      setMessage("Error creating reservation");
      console.error("Reservation error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="reservations" />

      {/* Main Content - Fixed Structure */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Make a Reservation
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Book your table at Bella Vista
          </p>

          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-center">
                Please{" "}
                <a
                  href="/login"
                  className="text-red-600 font-semibold hover:text-red-700"
                >
                  login
                </a>{" "}
                to make a reservation
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  disabled={!user}
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  required
                  disabled={!user}
                >
                  <option value="">Select time</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guests: parseInt(e.target.value),
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  required
                  disabled={!user}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="01012345678"
                  pattern="01[0-2,5]{1}[0-9]{8}"
                  disabled={!user}
                />
              </div>
            </div>

            {/* Availability Display */}
            {availableTables.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✓ {availableTables.length} tables available at {formData.time}
                </p>
              </div>
            )}

            {formData.date && formData.time && availableTables.length === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  No tables available for {formData.date} at {formData.time}
                </p>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !user || availableTables.length === 0}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Reservation...
                </div>
              ) : (
                "Make Reservation"
              )}
            </button>
          </form>

          {/* View Reservations Link */}
          {user && (
            <div className="mt-6 text-center">
              <a
                href="/my-reservations"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                View My Reservations →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
