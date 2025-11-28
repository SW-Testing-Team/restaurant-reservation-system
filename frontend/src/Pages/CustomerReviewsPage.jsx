import { useState, useEffect } from "react";
import axios from "axios";
import { Star, ChevronLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function CustomerAllReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/feedback/restaurantFeedbacks/sorted-feedbacks")
      .then((res) => setReviews(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  
  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "A";

  return (
    <>
      <Navbar />
      <section className="py-16 bg-gradient-to-b from-red-50 via-white to-red-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading + Back Button */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-red-100 text-red-700 font-semibold px-3 py-1 rounded-full shadow-sm hover:bg-red-200 transition-all duration-300 mr-6"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <h2 className="text-4xl md:text-5xl font-extrabold text-red-600 tracking-wide leading-tight">
              Flavors, Smiles & Stories:{" "}
              <span className="text-red-700">All Reviews</span>
            </h2>
          </div>

          {loading && (
            <p className="text-center text-gray-500 text-lg animate-pulse">
              Loading reviews...
            </p>
          )}
          {error && (
            <p className="text-center text-red-600 text-lg">
              Failed to load reviews.
            </p>
          )}
          {!loading && !error && reviews.length === 0 && (
            <p className="text-center text-gray-600 text-lg">
              No reviews yet.
            </p>
          )}

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((fb, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border border-red-100"
              >
                <div className="flex items-center mb-3">
                  {/* Avatar / Initials */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-700 font-bold mr-4">
                    {getInitials(fb.userId?.name)}
                  </div>

                  <div>
                    <p className="font-semibold text-lg text-red-700">
                      {fb.userId?.name || "Anonymous"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(fb.date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 mr-1 ${
                        i < fb.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-500 font-medium">
                    {fb.rating}/5
                  </span>
                </div>

                {/* Message */}
                <p className="text-gray-700 text-lg mb-4 italic border-l-4 border-red-200 pl-4">
                  "{fb.message}"
                </p>

                {/* Admin Reply */}
                {fb.reply && (
                  <div className="mt-4 p-4 bg-red-50 rounded-2xl border-l-4 border-red-600">
                    <p className="text-red-700 font-medium flex items-center justify-between">
                      {fb.adminId?.name || "Chef"}'s Reply
                      <span className="text-gray-400 text-xs ml-2">
                        {fb.replyDate &&
                          new Date(fb.replyDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-gray-700 text-sm mt-2">{fb.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
