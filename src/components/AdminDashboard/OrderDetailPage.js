import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Added updateDoc
import { db } from "../../firebase"; // Adjust the path to your Firebase config

function OrderDetailPage() {
    const { userId, orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false); // Added for showing update loading indicator

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const orderRef = doc(db, `users/${userId}/orders`, orderId);
                const orderSnapshot = await getDoc(orderRef);

                if (orderSnapshot.exists()) {
                    setOrderDetails(orderSnapshot.data());
                } else {
                    console.error("Order not found!");
                }
            } catch (error) {
                console.error("Error fetching order details: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [userId, orderId]);

    const handleUpdate = async (field, value) => {
        try {
            setUpdating(true);
            const orderRef = doc(db, `users/${userId}/orders`, orderId);
            await updateDoc(orderRef, { [field]: value });
            setOrderDetails((prev) => ({ ...prev, [field]: value })); // Update local state
        } catch (error) {
            console.error(`Error updating ${field}: `, error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!orderDetails) {
        return <div className="text-center py-8">Order not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gray-800 text-white py-6 shadow-md">
                <h1 className="text-2xl font-bold text-center">Order Details</h1>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* User Information */}
                <div className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">
                        User Information
                    </h2>
                    <div className="mt-4 space-y-2">
                        <p className="text-gray-600">
                            <strong>Name:</strong> {orderDetails.user?.username || "N/A"}
                        </p>
                        <p className="text-gray-600">
                            <strong>Email:</strong> {orderDetails.user?.email || "N/A"}
                        </p>
                        <p className="text-gray-600">
                            <strong>Address:</strong> {orderDetails.user?.address || "N/A"}
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">
                        Order Summary
                    </h2>
                    <div className="mt-4 space-y-4">
                        <p className="text-gray-600 break-words">
                            <strong>Order ID:</strong> {orderId}
                        </p>
                        <p className="text-gray-600">
                            <strong>Payment Method:</strong> {orderDetails.paymentMethod || "N/A"}
                        </p>
                        <div className="flex items-center space-x-4">
                            <p className="text-gray-600">
                                <strong>Payment Status:</strong>
                            </p>
                            <select
                                value={orderDetails.paymentStatus || ""}
                                onChange={(e) => handleUpdate("paymentStatus", e.target.value)}
                                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition duration-150"
                                disabled={updating}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="text-gray-600">
                                <strong>Delivery Status:</strong>
                            </p>
                            <select
                                value={orderDetails.deliveryStatus || ""}
                                onChange={(e) => handleUpdate("deliveryStatus", e.target.value)}
                                className="p-2 border rounded-md focus:ring-2 focus:ring-green-400 transition duration-150"
                                disabled={updating}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>
                        <p className="text-gray-600">
                            <strong>Subtotal:</strong> Rs. {orderDetails.subtotal || "N/A"}
                        </p>
                        <p className="text-gray-600">
                            <strong>Total:</strong> Rs. {orderDetails.total || "N/A"}
                        </p>
                        <p className="text-gray-600">
                            <strong>Created At:</strong>{" "}
                            {new Date(orderDetails.createdAt).toLocaleString() || "N/A"}
                        </p>
                    </div>
                </div>

                {/* Items Section */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">
                        Order Items
                    </h2>
                    {orderDetails.items && orderDetails.items.length > 0 ? (
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orderDetails.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 bg-gray-50 shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                                >
                                    <img
                                        src={item.image || "/placeholder-image.png"}
                                        alt={item.name}
                                        className="w-full h-32 object-cover rounded"
                                    />
                                    <div className="mt-4 space-y-2">
                                        <p className="text-gray-800 font-medium">
                                            {item.name || "Product Name"}
                                        </p>
                                        <p className="text-gray-600">
                                            <strong>Price:</strong> Rs. {item.price}
                                        </p>
                                        <p className="text-gray-600">
                                            <strong>Quantity:</strong> {item.quantity}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 mt-4">No items found in this order.</p>
                    )}
                </div>
            </main>
        </div>
    );

}

export default OrderDetailPage;
