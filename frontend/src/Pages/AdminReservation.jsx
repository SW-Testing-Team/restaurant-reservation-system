import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  MapPin,
  Trash2,
  Edit2,
  Check,
  X as CloseIcon,
  User,
  Mail,
  Search,
  Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { API_URL } from "../config/api";

const AdminReservation = () => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingReservation, setEditingReservation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: "",
    time: "",
    guests: 2,
    phoneNumber: "",
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, completed
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAllReservations();
    }
  }, [user]);

  // Check availability when date/time changes in edit mode
  useEffect(() => {
    if (editingReservation && editFormData.date && editFormData.time) {
      checkAvailability();
    }
  }, [editFormData.date, editFormData.time]);

  const fetchAllReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reservations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
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
        `${API_URL}/reservations/available?date=${editFormData.date}&time=${editFormData.time}`
      );
      if (response.ok) {
        let tables = await response.json();

        // If admin is changing to the same date/time, include the current table as available
        const currentReservation = reservations.find(
          (r) => r._id === editingReservation
        );
        if (
          currentReservation &&
          editFormData.date === currentReservation.date &&
          editFormData.time === currentReservation.time
        ) {
          if (!tables.includes(currentReservation.tableNumber)) {
            tables = [...tables, currentReservation.tableNumber];
          }
        }

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
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Reservation cancelled successfully");
        setReservations(
          reservations.filter((res) => res._id !== reservationId)
        );
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
      phoneNumber: reservation.phoneNumber || "",
    });
    setAvailableTables([]);
  };

  const cancelEdit = () => {
    setEditingReservation(null);
    setEditFormData({ date: "", time: "", guests: 2, phoneNumber: "" });
    setAvailableTables([]);
  };

  const updateReservation = async (reservationId) => {
    const currentReservation = reservations.find(
      (r) => r._id === reservationId
    );
    const isDateTimeChanged =
      editFormData.date !== currentReservation.date ||
      editFormData.time !== currentReservation.time;

    // Only check availability if date/time actually changed
    if (isDateTimeChanged && availableTables.length === 0) {
      setMessage("No tables available for the selected date and time");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setMessage("Reservation updated successfully");
        fetchAllReservations();
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
    // Create date in UTC to avoid timezone conversion
    const date = new Date(dateString + "T00:00:00Z"); // Force UTC time
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC", // Ensure no timezone conversion
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
    return (
      editFormData.date !== reservation.date ||
      editFormData.time !== reservation.time
    );
  };

  // Advanced Search and Filter Function
  const filteredReservations = reservations.filter((reservation) => {
    const reservationDateTime = new Date(
      `${reservation.date}T${reservation.time}`
    );
    const now = new Date();

    // Status filter
    let statusMatch = true;
    switch (filter) {
      case "upcoming":
        statusMatch = reservationDateTime >= now;
        break;
      case "completed":
        statusMatch = reservationDateTime < now;
        break;
      default:
        statusMatch = true;
    }

    // Search term filter (searches in reservation ID, user name, email, phone)
    const searchLower = searchTerm.toLowerCase();
    const searchMatch =
      !searchTerm ||
      reservation._id.toLowerCase().includes(searchLower) ||
      (reservation.userId?.name &&
        reservation.userId.name.toLowerCase().includes(searchLower)) ||
      (reservation.userId?.email &&
        reservation.userId.email.toLowerCase().includes(searchLower)) ||
      (reservation.phoneNumber &&
        reservation.phoneNumber.includes(searchTerm)) ||
      `reservation #${reservation._id.slice(-6).toUpperCase()}`.includes(
        searchLower
      );

    // Date filter
    const dateMatch = !dateFilter || reservation.date === dateFilter;

    // Time filter
    const timeMatch = !timeFilter || reservation.time === timeFilter;

    // Table filter
    const tableMatch =
      !tableFilter || reservation.tableNumber.toString() === tableFilter;

    return statusMatch && searchMatch && dateMatch && timeMatch && tableMatch;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setTimeFilter("");
    setTableFilter("");
    setFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm || dateFilter || timeFilter || tableFilter || filter !== "all";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading all reservations...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Admin Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to view this page.
          </p>
          <a
            href="/"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition inline-block"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="admin/reservations" />

      {/* Main Content */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Admin Reservations
            </h1>
            <p className="text-xl text-gray-600">
              Manage all restaurant reservations
            </p>
          </div>

          {/* Stats and Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 lg:mb-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {reservations.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Reservations
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      reservations.filter(
                        (r) => new Date(`${r.date}T${r.time}`) >= new Date()
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {
                      reservations.filter(
                        (r) => new Date(`${r.date}T${r.time}`) < new Date()
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>

              {/* Filter Toggle Button */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                    showFilters || hasActiveFilters
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters {hasActiveFilters && "•"}</span>
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reservation ID, name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All Times</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="21:00">9:00 PM</option>
                  </select>
                </div>

                {/* Table Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number
                  </label>
                  <select
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All Tables</option>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(
                      (table) => (
                        <option key={table} value={table}>
                          Table {table}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">All Reservations</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredReservations.length} of {reservations.length}{" "}
              reservations
              {hasActiveFilters && " (filtered)"}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-8 p-4 rounded-lg text-center ${
                message.includes("successfully")
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* Reservations List */}
          <div className="space-y-6">
            {filteredReservations.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  {hasActiveFilters
                    ? "No Matching Reservations"
                    : "No Reservations Found"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {hasActiveFilters
                    ? "Try adjusting your search criteria or clear filters."
                    : "No reservations have been made yet."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition inline-block mr-4"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              filteredReservations.map((reservation) => (
                <div
                  key={reservation._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      {/* Reservation Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">
                              Reservation #
                              {reservation._id.slice(-6).toUpperCase()}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>
                                  {reservation.userId?.name || "Unknown User"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <span>
                                  {reservation.userId?.email || "No email"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold mt-2 sm:mt-0 ${getStatusColor(
                              reservation.date,
                              reservation.time
                            )}`}
                          >
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
                              <p className="text-sm text-gray-500 font-medium mb-1">
                                Date & Time
                              </p>
                              {editingReservation === reservation._id ? (
                                <div className="space-y-2">
                                  <input
                                    type="date"
                                    value={editFormData.date}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        date: e.target.value,
                                      })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    min={new Date().toISOString().split("T")[0]}
                                  />
                                  <select
                                    value={editFormData.time}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        time: e.target.value,
                                      })
                                    }
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
                                  {isDateTimeChanged(reservation) &&
                                    editFormData.date &&
                                    editFormData.time && (
                                      <div
                                        className={`p-2 rounded-lg text-sm ${
                                          checkingAvailability
                                            ? "bg-blue-50 text-blue-800"
                                            : availableTables.length > 0
                                            ? "bg-green-50 text-green-800"
                                            : "bg-red-50 text-red-800"
                                        }`}
                                      >
                                        {checkingAvailability ? (
                                          <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <span>
                                              Checking availability...
                                            </span>
                                          </div>
                                        ) : availableTables.length > 0 ? (
                                          <div className="flex items-center space-x-2">
                                            <Check className="h-4 w-4" />
                                            <span>
                                              {availableTables.length} tables
                                              available
                                            </span>
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
                              <p className="text-sm text-gray-500 font-medium mb-1">
                                Table & Guests
                              </p>
                              {editingReservation === reservation._id ? (
                                <select
                                  value={editFormData.guests}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      guests: parseInt(e.target.value),
                                    })
                                  }
                                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                    <option key={num} value={num}>
                                      {num} guests
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <p className="font-semibold text-gray-800 text-lg">
                                  Table {reservation.tableNumber} •{" "}
                                  {reservation.guests} guests
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
                              <p className="text-sm text-gray-500 font-medium mb-1">
                                Contact
                              </p>
                              {editingReservation === reservation._id ? (
                                <input
                                  type="tel"
                                  value={editFormData.phoneNumber}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      phoneNumber: e.target.value,
                                    })
                                  }
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
                              <p className="text-sm text-gray-500 font-medium mb-1">
                                Location
                              </p>
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
                              disabled={
                                isDateTimeChanged(reservation) &&
                                availableTables.length === 0
                              }
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
        </div>
      </div>
    </div>
  );
};

export default AdminReservation;
