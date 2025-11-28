import { useEffect, useState } from "react";
import axios from "axios";
import { Star, Clock, CheckCircle } from "lucide-react";

function AdminRestaurantFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStars, setFilterStars] = useState(0); // 0 = all stars
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(`${API_URL}/feedback/restaurantFeedback`);
        setFeedbacks(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  if (loading) return <p className="p-8 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error.message}</p>;

  // Filter feedbacks based on search, status, and stars
  const filtered = feedbacks.filter((fb) => {
    const searchText = search.toLowerCase().trim();
    const matchesSearch =
      !searchText ||
      fb.message?.toLowerCase().includes(searchText) ||
      fb.userId?.name?.toLowerCase().includes(searchText) ||
      fb.userId?.email?.toLowerCase().includes(searchText);

    const matchesStatus = filterStatus === "all" ? true : fb.status === filterStatus;
    const matchesStars = filterStars === 0 ? true : fb.rating === filterStars;

    return matchesSearch && matchesStatus && matchesStars;
  });

  const handleReplySubmit = async () => {
    if (!replyMessage.trim() || !currentFeedback) return;

    setReplyLoading(true);
    try {
      await axios.patch(
        `${API_URL}/feedback/restaurant/${currentFeedback._id}/reply`,
        { reply: replyMessage },
        { withCredentials: true }
      );

      setFeedbacks((prev) =>
        prev.map((fb) =>
          fb._id === currentFeedback._id
            ? { ...fb, reply: replyMessage, status: "replied", replyDate: new Date() }
            : fb
        )
      );

      setModalOpen(false);
      setCurrentFeedback(null);
      setReplyMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  const totalFeedbacks = feedbacks.length;
  const pendingCount = feedbacks.filter((f) => f.status === "pending").length;
  const repliedCount = feedbacks.filter((f) => f.status === "replied").length;
  const averageRating =
    feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  {/* Title and Back Button */}
  <div className="flex items-center justify-between mb-10">
    {/* Back Button */}
    <button
      onClick={() => window.history.back()}
      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium shadow-sm transition"
    >
      ← Back
    </button>

    {/* Title centered */}
    <h1 className="text-4xl font-semibold text-gray-800 tracking-wide absolute left-1/2 transform -translate-x-1/2">
      Restaurant Feedback Dashboard
    </h1>

    {/* Placeholder to balance flex space */}
    <div className="w-24"></div>
  </div>

  


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center transition transform hover:scale-105">
          <CheckCircle className="h-8 w-8 mb-2 text-indigo-600" />
          <span className="text-sm opacity-90">Total Feedbacks</span>
          <span className="text-3xl font-bold">{totalFeedbacks}</span>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center transition transform hover:scale-105">
          <Clock className="h-8 w-8 mb-2 text-yellow-600" />
          <span className="text-sm opacity-90">Pending</span>
          <span className="text-3xl font-bold">{pendingCount}</span>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 text-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center transition transform hover:scale-105">
          <CheckCircle className="h-8 w-8 mb-2 text-green-600" />
          <span className="text-sm opacity-90">Replied</span>
          <span className="text-3xl font-bold">{repliedCount}</span>
        </div>
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 text-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center transition transform hover:scale-105">
          <Star className="h-8 w-8 mb-2 text-teal-600" />
          <span className="text-sm opacity-90">Avg Rating</span>
          <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by user, email, or message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Status Filter */}
        <div className="flex gap-2">
          {["all", "pending", "replied"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                filterStatus === status
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Star Filter Dropdown */}
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={filterStars}
          onChange={(e) => setFilterStars(Number(e.target.value))}
        >
          <option value={0}>All Stars</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} Star{star > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 relative">
        <table className="min-w-[950px] bg-white divide-y divide-gray-200 rounded-xl">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Message</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reply</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Admin</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reply Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map((fb) => (
              <tr key={fb._id} className="bg-white hover:shadow-lg transition-all duration-200">
                <td className="px-4 py-2 whitespace-normal">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{fb.userId?.name || "Unknown"}</span>
                    <span className="text-gray-500 text-xs">{fb.userId?.email || "-"}</span>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-normal max-w-[300px] break-words">
                  <p className="text-gray-700">{fb.message}</p>
                </td>
                <td className="px-4 py-2 flex items-center gap-1">
                  {[...Array(fb.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500" />
                  ))}
                  {[...Array(5 - fb.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gray-300" />
                  ))}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      fb.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {fb.status.charAt(0).toUpperCase() + fb.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(fb.date).toLocaleDateString()}</td>
                <td className="px-4 py-2 whitespace-normal max-w-[250px]">
                  <p className="text-gray-700 text-sm">{fb.reply || "-"}</p>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{fb.adminId?.name || "-"}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{fb.replyDate ? new Date(fb.replyDate).toLocaleString() : "-"}</td>
                <td className="px-4 py-2 whitespace-nowrap sticky right-0 bg-white border-l border-gray-200 z-10">
                  <button
                    className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition text-sm shadow-sm w-full"
                    onClick={() => {
                      setCurrentFeedback(fb);
                      setModalOpen(true);
                      setReplyMessage(fb.reply || "");
                    }}
                  >
                    Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {modalOpen && currentFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Reply to Feedback</h2>
            <p className="mb-2">
              <span className="font-medium">From:</span> {currentFeedback.userId?.name} ({currentFeedback.userId?.email})
            </p>
            <p className="mb-4">
              <span className="font-medium">Message:</span> {currentFeedback.message}
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none mb-4"
              rows={4}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {replyLoading ? "Sending..." : "Send Reply"}
              </button>
            </div>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurantFeedbacks;
