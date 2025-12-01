import { useState, useEffect } from "react";
import {
  CalendarDays,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";
const API_URL = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 403) {
          // User is not admin, redirect to home
          window.location.href = "/home";
          return;
        }

        if (response.status === 401) {
          // User is not authenticated, redirect to login
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Prepare chart data
  const getChartData = () => {
    if (!stats?.topMenuItems) return [];
    return stats.topMenuItems.map((item) => ({
      name: item.menuItem?.name || "Unknown",
      orderCount: item.orderCount,
      category: item.menuItem?.category || "N/A",
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="admin/dashboard" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="admin/dashboard" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 text-xl font-semibold mb-2">
              Error Loading Dashboard
            </p>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="admin/dashboard" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 ml-12">
            Administrator overview of restaurant performance and analytics
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Feedback Summary Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Feedback Summary</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Feedback</p>
                <p className="text-3xl font-bold text-purple-700">
                  {stats?.feedbackSummary?.totalFeedback || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Average Rating</p>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <p className="text-3xl font-bold text-yellow-700">
                    {stats?.feedbackSummary?.averageRating?.toFixed(1) || "0.0"}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-700">
                  {stats?.feedbackSummary?.pendingFeedback || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting reply</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Replied</p>
                <p className="text-3xl font-bold text-green-700">
                  {stats?.feedbackSummary?.repliedFeedback || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Responded</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Breakdown</p>
                <p className="text-lg font-semibold text-blue-700">
                  Restaurant: {stats?.feedbackSummary?.restaurantFeedback || 0}
                </p>
                <p className="text-lg font-semibold text-blue-700">
                  Menu Items: {stats?.feedbackSummary?.itemFeedback || 0}
                </p>
              </div>
            </div>
          </div>
          {/* Total Reservations Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  Total Reservations
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats?.totalReservations || 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">All time</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CalendarDays className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats?.totalOrders || 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">All time</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  Total Revenue
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.totalRevenue)}
                </p>
                <p className="text-sm text-gray-400 mt-1">All time</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Top Items Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  Popular Items
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats?.topMenuItems?.length || 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">Top sellers</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Bar Chart - Top Menu Items */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Top 5 Most Ordered Menu Items</span>
              </h2>
            </div>
            <div className="p-6">
              {stats?.topMenuItems && stats.topMenuItems.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getChartData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        allowDecimals={false}
                        label={{
                          value: "Order Count",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#6b7280",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                        }}
                        formatter={(value) => [value, "Orders"]}
                        labelFormatter={(label) => `Item: ${label}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="orderCount"
                        name="Orders"
                        fill="#dc2626"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-xl">
                  <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No order data available yet
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Place some orders to see the chart
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Menu Items Table */}
          {stats?.topMenuItems && stats.topMenuItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  Top Menu Items Details
                </h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wider rounded-tl-lg">
                          Rank
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wider">
                          Item Name
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wider">
                          Category
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wider">
                          Price
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wider rounded-tr-lg">
                          Orders
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.topMenuItems.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                index === 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : index === 1
                                  ? "bg-gray-200 text-gray-700"
                                  : index === 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-900">
                            {item.menuItem?.name || "Unknown"}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                              {item.menuItem?.category || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600 font-medium">
                            {formatCurrency(item.menuItem?.price)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                              {item.orderCount} orders
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
