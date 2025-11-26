import { useState, useEffect } from "react";
import { ChefHat, Plus, Edit2, Trash2, X, Save } from "lucide-react";
import axios from "axios";

function AdminMenuPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Form data
  const [menuForm, setMenuForm] = useState({
    _id: null,
    title: "",
    description: "",
  });

  const [itemForm, setItemForm] = useState({
    _id: null,
    menuId: "",
    name: "",
    desc: "",
    price: "",
    imageUrl: "",
    ingredients: "",
    allergens: "",
  });

  // Fetch all menus
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/menu");
      setMenus(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Menu CRUD operations
  const handleCreateMenu = async () => {
    try {
      await axios.post("http://localhost:3000/menu", {
        title: menuForm.title,
        description: menuForm.description,
      });
      fetchMenus();
      closeMenuModal();
    } catch (err) {
      alert("Error creating menu: " + err.message);
    }
  };

  const handleUpdateMenu = async () => {
    try {
      await axios.put(`http://localhost:3000/menu/${menuForm._id}`, {
        title: menuForm.title,
        description: menuForm.description,
      });
      fetchMenus();
      closeMenuModal();
    } catch (err) {
      alert("Error updating menu: " + err.message);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;

    try {
      await axios.delete(`http://localhost:3000/menu/${menuId}`);
      fetchMenus();
    } catch (err) {
      alert("Error deleting menu: " + err.message);
    }
  };

  // Menu Item CRUD operations
  const handleCreateItem = async () => {
    try {
      await axios.post(`http://localhost:3000/menu/${itemForm.menuId}/items`, {
        name: itemForm.name,
        desc: itemForm.desc,
        price: parseFloat(itemForm.price),
        imageUrl: itemForm.imageUrl,
        ingredients: itemForm.ingredients,
        allergens: itemForm.allergens,
      });
      fetchMenus();
      closeItemModal();
    } catch (err) {
      alert("Error creating item: " + err.message);
    }
  };

  const handleUpdateItem = async () => {
    try {
      await axios.put(
        `http://localhost:3000/menu/${itemForm.menuId}/items/${itemForm._id}`,
        {
          name: itemForm.name,
          desc: itemForm.desc,
          price: parseFloat(itemForm.price),
          imageUrl: itemForm.imageUrl,
          ingredients: itemForm.ingredients,
          allergens: itemForm.allergens,
        }
      );
      fetchMenus();
      closeItemModal();
    } catch (err) {
      alert("Error updating item: " + err.message);
    }
  };

  const handleDeleteItem = async (menuId, itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(
        `http://localhost:3000/menu/${menuId}/items/${itemId}`
      );
      fetchMenus();
    } catch (err) {
      alert("Error deleting item: " + err.message);
    }
  };

  // Modal handlers
  const openMenuModal = (menu = null) => {
    if (menu) {
      setMenuForm({
        _id: menu._id,
        title: menu.title,
        description: menu.description || "",
      });
    } else {
      setMenuForm({ _id: null, title: "", description: "" });
    }
    setIsMenuModalOpen(true);
  };

  const closeMenuModal = () => {
    setIsMenuModalOpen(false);
    setMenuForm({ _id: null, title: "", description: "" });
  };

  const openItemModal = (menuId, item = null) => {
    if (item) {
      setItemForm({
        _id: item._id,
        menuId: menuId,
        name: item.name,
        desc: item.desc,
        price: item.price.toString(),
        imageUrl: item.imageUrl,
        ingredients: item.ingredients || "",
        allergens: item.allergens || "",
      });
    } else {
      setItemForm({
        _id: null,
        menuId: menuId,
        name: "",
        desc: "",
        price: "",
        imageUrl: "",
        ingredients: "",
        allergens: "",
      });
    }
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setItemForm({
      _id: null,
      menuId: "",
      name: "",
      desc: "",
      price: "",
      imageUrl: "",
      ingredients: "",
      allergens: "",
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-2xl font-bold text-gray-800">
                Admin - Menu Management
              </span>
            </div>
            <a href="/" className="text-gray-700 hover:text-red-600 transition">
              Back to Home
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Menu Button */}
        <div className="mb-8">
          <button
            onClick={() => openMenuModal()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Menu</span>
          </button>
        </div>

        {/* Menus List */}
        <div className="space-y-8">
          {menus.map((menu) => (
            <div key={menu._id} className="bg-white rounded-lg shadow-md p-6">
              {/* Menu Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {menu.title}
                  </h2>
                  {menu.description && (
                    <p className="text-gray-600 mt-1">{menu.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openMenuModal(menu)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(menu._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Add Item Button */}
              <button
                onClick={() => openItemModal(menu._id)}
                className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center space-x-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item to {menu.title}</span>
              </button>

              {/* Menu Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menu.items && menu.items.length > 0 ? (
                  menu.items.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {item.name}
                          </h3>
                          <span className="text-red-600 font-bold">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.desc}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openItemModal(menu._id, item)}
                            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(menu._id, item._id)}
                            className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full text-center py-8">
                    No items in this menu yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {menus.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No menus created yet. Create your first menu!
            </p>
          </div>
        )}
      </div>

      {/* Menu Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {menuForm._id ? "Edit Menu" : "Create New Menu"}
              </h2>
              <button
                onClick={closeMenuModal}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Title *
                </label>
                <input
                  type="text"
                  value={menuForm.title}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="e.g., Appetizers, Main Courses"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeMenuModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={menuForm._id ? handleUpdateMenu : handleCreateMenu}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{menuForm._id ? "Update" : "Create"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {itemForm._id ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>
              <button
                onClick={closeItemModal}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="e.g., Bruschetta"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="9.99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    value={itemForm.imageUrl}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, imageUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={itemForm.desc}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, desc: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    rows="3"
                    placeholder="Describe the dish..."
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <input
                    type="text"
                    value={itemForm.ingredients}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, ingredients: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="Tomatoes, Basil, Garlic, Olive Oil"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergens
                  </label>
                  <input
                    type="text"
                    value={itemForm.allergens}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, allergens: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="Gluten, Dairy, Nuts"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeItemModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={itemForm._id ? handleUpdateItem : handleCreateItem}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{itemForm._id ? "Update" : "Add Item"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMenuPage;
