import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Star, Clock, MapPin, Phone, ChefHat } from "lucide-react"; // icons
import { Link } from "react-router-dom";



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


//for the feedbacks section
const [feedbacks, setFeedbacks] = useState([]);
const [feedbackError, setFeedbackError] = useState(null);
// Add Review Form States
const [showForm, setShowForm] = useState(false);
const [newMessage, setNewMessage] = useState("");
const [newRating, setNewRating] = useState(0);
const [submitting, setSubmitting] = useState(false);



useEffect(() => {
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/feedback/restaurantFeedbacks/recent"
      );
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
      setFeedbackError(err);
    }
  };
  fetchFeedbacks();
}, []);




const handleSubmitFeedback = async () => {
  if (!newMessage || newRating === 0) {
    alert("Please write a review and select a rating.");
    return;
  }

  try {
    setSubmitting(true);
    
    await axios.post(
      "http://localhost:3000/feedback/addRestaurantFeedback",
      {
        message: newMessage,
        rating: newRating,
      },
      { withCredentials: true }
    );

    alert("Review added successfully!");

    // Reset fields
    setNewMessage("");
    setNewRating(0);
    setShowForm(false);

    // Refresh list
    const res = await axios.get(
      "http://localhost:3000/feedback/restaurantFeedbacks/recent"
    );
    setFeedbacks(res.data);

  } catch (err) {
    console.error(err);
    alert("Error submitting review.");
  } finally {
    setSubmitting(false);
  }
};



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


        <a href="#top-rated">
        {   
       <button
       className="
         ml-4
         mt-5 px-6 py-3 rounded-full
         text-white text-lg font-medium
         bg-white/20
         hover:bg-white/30
         transition-all
         backdrop-blur-sm
         border border-white/30
       "
     >
       ⭐️View Our Top Rated Items
     </button>
     
      
      }
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


      <section id="recent-feedback" className="py-16 bg-gradient-to-b from-red-50 via-white to-red-50">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-red-600 tracking-wide leading-tight">
      Flavors, Smiles & Stories: 
      <span className="text-red-700">Our Guests Speak</span>
    </h2>

    {feedbackError && (
      <p className="text-red-600 text-center mb-6">
        Error loading feedbacks
      </p>
    )}

    {feedbacks.length === 0 ? (
      <p className="text-center text-gray-600">No feedbacks yet.</p>
    ) : (
      <div className="space-y-8">
        {feedbacks.map((fb, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl shadow-xl p-6 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-lg text-red-700">{fb.username}</span>
              </div>
              <span className="text-gray-400 text-sm">
                {new Date(fb.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center mb-3">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 mr-1 ${i < fb.rating ? "text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>

            <p className="text-gray-700 text-lg mb-3 italic">"{fb.message}"</p>

            {fb.reply && (
              <div className="mt-4 p-4 bg-red-50 rounded-2xl border-l-4 border-red-600">
                <p className="text-red-700 font-medium">Chef's Reply:</p>
                <p className="text-gray-700 text-sm mt-1">{fb.reply}</p>
                {fb.replyDate && (
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(fb.replyDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Buttons */}
    <div className="mt-12">

      {/* Centered See All Reviews Button */}
        <div className="flex justify-center mb-8">
          <Link
            to="/all-reviews"
            className="inline-block px-6 py-3 font-semibold rounded-full shadow-lg text-white 
                      bg-gradient-to-r from-red-600 to-orange-500 
                      hover:from-red-700 hover:to-orange-600 transition-all duration-300"
          >
            See All Reviews
          </Link>
        </div>


        <div className="mt-12 max-w-2xl mx-auto bg-gradient-to-r from-[#fefcf5] to-[#f7f7f7] rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-4">
  {/* Text */}
  <div className="text-center md:text-left">
    <h3 className="text-2xl md:text-3xl font-semibold text-[#3b4f6b]">
      Your Reflections Matter
    </h3>
    <p className="mt-1 text-base md:text-lg text-[#5c6d7b]">
    A brief review would be sincerely appreciated.    </p>
  </div>

  {/* Button */}
  <button
    onClick={() => {
      if (!user) {
        alert("Please login to add your review.");
        return;
      }
      setShowForm(!showForm);
    }}
    className="px-6 py-2 font-semibold rounded-full shadow-md text-white
               bg-gradient-to-r from-[#7da9d9] to-[#4d7ea8]
               hover:from-[#6b95c3] hover:to-[#3f6990]
               transition-all duration-300"
  >
    📝 Add Your Review
  </button>
</div>


    </div>

    {showForm && (
      <div className="mt-10 bg-white p-6 rounded-3xl shadow-xl">
        <h3 className="text-2xl font-bold text-red-600 mb-4 text-center">
          Share Your Experience
        </h3>

        {/* Rating */}
        <div className="flex justify-center mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              onClick={() => setNewRating(i + 1)}
              className={`w-8 h-8 cursor-pointer ${
                i < newRating ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Message Input */}
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
          rows="4"
          placeholder="Write your review..."
        ></textarea>

        {/* Submit Button */}
        <div className="text-center mt-4">
          <button
            disabled={submitting}
            onClick={handleSubmitFeedback}
            className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    )}

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