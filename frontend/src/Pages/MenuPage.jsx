import { useState, useEffect } from "react";
import { ChefHat, X } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function MenuPage() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/menu`);
        setMenu(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (menuLoading) return <p>Loading menu...</p>;
  if (error) return <p>Error fetching menu: {error.message}</p>;

  const openItemModal = (item) => {
    setSelectedItem(item);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
  };

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

            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-700 hover:text-red-600 transition"
              >
                Home
              </a>
              <button
                onClick={() => navigate("/order")}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition font-semibold"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="pt-24 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">Our Menu</h1>
          <p className="text-center text-gray-600 text-lg">
            Explore our delicious Italian cuisine
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {menu.map((section, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-3xl font-bold text-red-600 mb-6 border-b-2 border-red-600 pb-2">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer"
                  onClick={() => openItemModal(item)}
                >
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover hover:opacity-90 transition"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h4>
                      <span className="text-red-600 font-bold">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={closeItemModal}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeItemModal}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Image Section */}
              <div className="relative h-64 md:h-full">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                />
              </div>

              {/* Details Section */}
              <div className="p-6 md:p-8 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {selectedItem.name}
                  </h2>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-red-600">
                      ${selectedItem.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedItem.desc ||
                        selectedItem.description ||
                        "Delicious dish prepared with fresh ingredients."}
                    </p>
                  </div>

                  {selectedItem.ingredients && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Ingredients
                      </h3>
                      <p className="text-gray-600">
                        {selectedItem.ingredients}
                      </p>
                    </div>
                  )}

                  {selectedItem.allergens && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Allergens
                      </h3>
                      <p className="text-gray-600">{selectedItem.allergens}</p>
                    </div>
                  )}
                </div>

                {/* Order Button */}
                <button
                  onClick={() => {
                    navigate("/order");
                    closeItemModal();
                  }}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Order This Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
