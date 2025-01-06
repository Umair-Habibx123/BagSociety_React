import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust the path to your Firebase config
import { useNavigate } from "react-router-dom"; // For navigation to the detail page

function ManageOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [orderIdFilter, setOrderIdFilter] = useState("");
    const [usernameFilter, setUsernameFilter] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
    const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const usersCollection = await getDocs(collection(db, "users"));
                const allOrders = [];

                for (const userDoc of usersCollection.docs) {
                    const userOrdersCollection = collection(
                        db,
                        `users/${userDoc.id}/orders`
                    );
                    const userOrders = await getDocs(userOrdersCollection);

                    userOrders.forEach((orderDoc) => {
                        const orderData = orderDoc.data();
                        const userInfo = orderData.user || {}; // Ensure `user` field exists

                        allOrders.push({
                            userEmail: userDoc.id,
                            username: userInfo.username || "N/A",
                            email: userInfo.email || "N/A",
                            address: userInfo.address || "N/A",
                            ...orderData,
                            orderId: orderDoc.id,
                        });
                    });
                }

                setOrders(allOrders);
                setFilteredOrders(allOrders); // Initial filtering
            } catch (error) {
                console.error("Error fetching orders: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Handle filtering
    useEffect(() => {
        let updatedOrders = orders;

        if (orderIdFilter) {
            updatedOrders = updatedOrders.filter((order) =>
                order.orderId.toLowerCase().includes(orderIdFilter.toLowerCase())
            );
        }

        if (usernameFilter) {
            updatedOrders = updatedOrders.filter((order) =>
                order.username.toLowerCase().includes(usernameFilter.toLowerCase())
            );
        }

        if (emailFilter) {
            updatedOrders = updatedOrders.filter((order) =>
                order.email.toLowerCase().includes(emailFilter.toLowerCase())
            );
        }

        if (paymentStatusFilter) {
            updatedOrders = updatedOrders.filter(
                (order) =>
                    order.paymentStatus &&
                    order.paymentStatus.toLowerCase() === paymentStatusFilter.toLowerCase()
            );
        }

        if (deliveryStatusFilter) {
            updatedOrders = updatedOrders.filter(
                (order) =>
                    order.deliveryStatus &&
                    order.deliveryStatus.toLowerCase() === deliveryStatusFilter.toLowerCase()
            );
        }

        if (dateFilter) {
            updatedOrders = updatedOrders.filter((order) => {
                const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
                return orderDate === dateFilter;
            });
        }

        setFilteredOrders(updatedOrders);
    }, [
        orderIdFilter,
        usernameFilter,
        emailFilter,
        paymentStatusFilter,
        deliveryStatusFilter,
        dateFilter,
        orders,
    ]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-800 text-white py-4 px-6 shadow-md">
                <h1 className="text-2xl font-semibold text-center">Manage Orders</h1>
            </header>

            {/* Main Section */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters Section */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Order ID Filter */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Filter by Order ID
                        </label>
                        <input
                            type="text"
                            value={orderIdFilter}
                            onChange={(e) => setOrderIdFilter(e.target.value)}
                            placeholder="Enter order ID"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                    </div>

                    {/* Username Filter */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Filter by Username
                        </label>
                        <input
                            type="text"
                            value={usernameFilter}
                            onChange={(e) => setUsernameFilter(e.target.value)}
                            placeholder="Enter username"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                    </div>

                    {/* Email Filter */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Filter by Email
                        </label>
                        <input
                            type="text"
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                            placeholder="Enter email"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Filter by Date
                        </label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Filter by Payment Status
                        </label>
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {/* Delivery Status Filter */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Filter by Delivery Status
                        </label>
                        <select
                            value={deliveryStatusFilter}
                            onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <p className="text-center text-gray-600">No orders found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.orderId}
                                onClick={() =>
                                    navigate(
                                        `/admin-dashboard/manageOrders/${order.userEmail}/${order.orderId}`
                                    )
                                }
                                className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-transform transform hover:scale-105 cursor-pointer"
                            >
                                <h2
                                    className="text-xl font-bold text-gray-800 mb-2 truncate w-full"
                                    title={`Order ID: ${order.orderId}`}
                                >
                                    Order ID: {order.orderId}
                                </h2>

                                <p className="text-gray-600">
                                    <strong>User:</strong> {order.username}
                                </p>

                                <p className="text-gray-600">
                                    <strong>Email:</strong> {order.email}
                                </p>

                                <p className="text-gray-600">
                                    <strong>Delivery Status:</strong> {order.deliveryStatus}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );

}

export default ManageOrdersPage;
