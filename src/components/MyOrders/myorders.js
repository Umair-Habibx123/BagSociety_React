import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { db } from "../../firebase"; // Firebase setup
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useUser } from "../../context/UserContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const MyOrdersPage = () => {
    const currentUser = useUser(); // Get the logged-in user from context
    const navigate = useNavigate(); // Initialize useNavigate for redirects
    const [orders, setOrders] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingUserDetails, setLoadingUserDetails] = useState(true);
    const [userEmail, setUserEmail] = useState("");

    // Redirect non-logged-in users
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
            if (user) {
                setUserEmail(user.email); // Set the email of the logged-in user
            } else {
                console.error("No user is signed in");
                navigate("/"); // Redirect to login page if not logged in
            }
        });

        return () => unsubscribe(); // Cleanup subscription on component unmount
    }, [navigate]);

    // Fetch user details
    useEffect(() => {
        if (!userEmail) return; // If no email, skip fetching

        const fetchUserDetails = async () => {
            try {
                setLoadingUserDetails(true);
                const docRef = doc(db, "users", userEmail); // Use userEmail as the document ID
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserDetails(data); // Store user data (username, email, etc.)
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching user details: ", error);
            } finally {
                setLoadingUserDetails(false);
            }
        };

        fetchUserDetails();
    }, [userEmail]);

    // Fetch orders from the user's "orders" subcollection
    useEffect(() => {
        if (!currentUser) return; // If user is not logged in, skip fetching orders

        const fetchOrders = async () => {
            try {
                setLoadingOrders(true);
                const ordersRef = collection(db, "users", currentUser.email, "orders"); // Orders subcollection using email as the document ID
                const querySnapshot = await getDocs(ordersRef);
                const ordersData = [];

                querySnapshot.forEach((doc) => {
                    const orderData = doc.data();
                    ordersData.push({
                        id: doc.id, // Order ID is the document ID in the "orders" subcollection
                        createdAt: orderData.createdAt,
                        items: orderData.items,
                        paymentMethod: orderData.paymentMethod,
                        status: orderData.status,
                        subtotal: orderData.subtotal,
                        total: orderData.total
                    });
                });

                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders: ", error);
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [currentUser]);

    // Loading State
    if (loadingOrders || loadingUserDetails) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="animate-spin border-4 border-blue-400 rounded-full w-10 h-10 border-t-transparent"></div>
            </div>
        );
    }

    // No Orders Found
    if (!orders.length) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">No Orders Found</h2>
                    <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h2>

                        {/* Display user details */}
                        {userDetails && (
                            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800">User Information</h3>
                                <p className="text-gray-600">Username: {userDetails.username}</p>
                                <p className="text-gray-600">Email: {userDetails.email}</p>
                            </div>
                        )}

                        {/* Display Orders */}
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="mb-6 p-4 border rounded-lg shadow-sm bg-white"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 break-all">
                                    Order ID: {order.id}
                                </h3>
                                <p className="text-sm text-gray-500">Placed on: {order.createdAt}</p>
                                <div className="mt-4">
                                    <h4 className="text-base font-semibold text-gray-700">
                                        Items
                                    </h4>
                                    <ul className="space-y-2">
                                        {order.items.map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex justify-between text-gray-600"
                                            >
                                                <span>{item.name}</span>
                                                <span>
                                                    Rs. {item.price} x {item.quantity}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <p className="text-lg font-semibold text-gray-700">
                                        Subtotal: Rs. {order.subtotal}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-700">
                                        Total: Rs. {order.total}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Payment Method: {order.paymentMethod}
                                    </p>
                                    <p className="text-sm text-gray-500">Status: {order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;
