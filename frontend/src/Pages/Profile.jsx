import { useContext } from "react";
import { AuthContext } from "../context/authContext";

function Profile() {
  const { user } = useContext(AuthContext);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Your Profile
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-500">Name</h3>
            <p className="text-lg font-medium text-gray-800">{user.name}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Email</h3>
            <p className="text-lg font-medium text-gray-800">{user.email}</p>
          </div>

          {user.phoneNumber && (
            <div>
              <h3 className="text-sm text-gray-500">Phone Number</h3>
              <p className="text-lg font-medium text-gray-800">
                {user.phoneNumber}
              </p>
            </div>
          )}
        </div>

        {/* Buttons side-by-side */}
        <div className="flex gap-4 mt-8">
          <a
            href="/home"
            className="flex-1 text-center bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Home
          </a>

          <button
            onClick={handleLogout}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
