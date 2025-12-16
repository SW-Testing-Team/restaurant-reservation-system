import { useState, useEffect } from "react";
import { ChefHat, Plus, Minus, Trash2, ShoppingCart, X } from "lucide-react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { API_URL } from "../config/api";

function OrderPage() {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("dine-in");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { user, loading } = useContext(AuthContext);

  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tablesLoading, setTablesLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      alert("You must be logged in to place an order.");
      window.location.href = "/login";
      return;
    }
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/menu`);
        setMenu(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setMenuLoading(false);
        console.log("userdata:", user);
      }
    };

    const fetchTables = async () => {
      try {
        setTablesLoading(true);
        const response = await axios.get(
          `${API_URL}/reservations/my-reservations`,
          {
            withCredentials: true,
          }
        );
        // Create table numbers based on users count or use user data
        const userList = response.data.data || response.data;
        setTables(userList);
        if (orderType === "dine-in" && userList.length > 0) {
          setSelectedTable(userList[0]._id || userList[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch tables:", err);
        // Create dummy tables if API fails
        const dummyTables = Array.from({ length: 10 }, (_, i) => ({
          _id: `table-${i + 1}`,
          name: `Table ${i + 1}`,
        }));
        setTables(dummyTables);
      } finally {
        setTablesLoading(false);
      }
    };

    fetchMenu();
    fetchTables();
  }, [user]);

  if (menuLoading) return <p>Loading menu...</p>;
  if (error) return <p>Error fetching menu: {error.message}</p>;

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(
      cart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const getTotal = () => {
    return cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (orderType === "dine-in" && !selectedTable) {
      alert("Please select a table!");
      return;
    }

    console.log("cart", cart);
    const orderData = {
      userId: user.id,
      type: orderType,
      items: cart.map((item) => ({
        menuItemId: item._id,
        quantity: item.quantity,
      })),
      totalPrice: parseFloat(getTotal()),
    };

    // Add tableNumber if dine-in
    if (orderType === "dine-in" && selectedTable) {
      orderData.tableNumber = Number(selectedT  able);
    }
    console.log("orderData", orderData);
    axios.post(`${API_URL}/orders`, orderData);

    alert(
      `Order placed successfully!\nType: ${orderType}${
        orderType === "dine-in" ? `\nTable: ${selectedTable}` : ""
      }\nTotal: $${getTotal()}`
    );
    setCart([]);
    setIsCartOpen(false);
  };

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
                onClick={() => setIsCartOpen(true)}
                className="relative bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Order Type Selection */}
      <div className="pt-24 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-8">Order Now</h1>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => {
                setOrderType("dine-in");
                if (tables.length > 0) {
                  setSelectedTable(tables[0]._id || tables[0].id);
                }
              }}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                orderType === "dine-in"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => {
                setOrderType("takeaway");
                setSelectedTable(null);
              }}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                orderType === "takeaway"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Takeaway
            </button>
            <button
              onClick={() => {
                setOrderType("delivery");
                setSelectedTable(null);
              }}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                orderType === "delivery"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Delivery
            </button>
          </div>

          {/* Table Selection for Dine-In */}
          {orderType === "dine-in" && (
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Table
                </label>
                <select
                  value={selectedTable || ""}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  disabled={tablesLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                >
                  <option value="">
                    {tablesLoading ? "Loading tables..." : "Choose a table"}
                  </option>
                  {tables.map((table) => (
                    <option key={table._id} value={table.tableNumber}>
                      {`Table #${table.tableNumber} on ${table.date}` ||
                        `Table ${table._id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
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
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                      onClick={() => openItemModal(item)}
                    />
                    <button
                      onClick={() => addToCart(item)}
                      className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
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

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    addToCart(selectedItem);
                    closeItemModal();
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsCartOpen(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Cart Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-red-600 font-bold">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="ml-auto text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t p-6 bg-gray-50">
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Order Type:</span>
                  <span className="font-semibold capitalize">
                    {orderType.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-red-600">${getTotal()}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPage;
