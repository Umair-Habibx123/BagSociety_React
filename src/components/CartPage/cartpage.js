import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Firebase setup
import { Link } from "react-router-dom";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "../../context/UserContext";

const CartPage = () => {
    const currentUser = useUser(); // Get the logged-in user from context
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null); // User state to manage logged-in user info
    const [profilePic, setProfilePic] = useState("/default-profile.png"); // Default profile picture  
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [userRole, setUserRole] = useState("user"); // State to store the user's role
    const [selectAll, setSelectAll] = useState(false);
    const [loadingItem, setLoadingItem] = useState(null); // To track loading state for individual items

    useEffect(() => {
        if (currentUser) {
            const fetchCart = async () => {
                const cartRef = doc(db, "userCart", currentUser.email);
                const cartDoc = await getDoc(cartRef);

                if (cartDoc.exists()) {
                    const items = cartDoc.data().items || [];
                    setCart(items);
                    calculateTotalPrice(items, selectedItems);
                }
            };
            fetchCart();
        }
    }, [currentUser]);

    useEffect(() => {
        calculateTotalPrice(cart, selectedItems);
    }, [selectedItems, cart]);


    const handleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider); // Trigger Google sign-in
            const user = result.user; // Get the logged-in user

            // Reference to the user's document in Firestore using their email
            const userDocRef = doc(db, "users", user.email);

            // Check if the user's document already exists
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                // If the user document exists, load existing data
                const userData = userDocSnap.data();
                setUserRole(userData.role || "user"); // Set user role from Firestore
                setProfilePic(userData.profilePic || "/default-profile.png"); // Set the profile picture from Firestore
                window.location.reload(); // This will refresh the website
            } else {
                // If the user document doesn't exist, create a new one
                await setDoc(userDocRef, {
                    username: user.displayName,
                    email: user.email,
                    profilePic: user.photoURL || "/default-profile.png", // Set default photo if none exists
                    role: "user",
                });
                setProfilePic(user.photoURL || "/default-profile.png"); // Set the profile picture
                setUserRole("user");

            }

            setUser(user); // Update the user state with the logged-in user's info
            // Reload the page to reflect changes
            window.location.reload(); // This will refresh the website
        } catch (error) {
            console.error("Error logging in with Google:", error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!currentUser) return;

        setLoadingItem(itemId); // Set loading for the specific item
        const updatedCart = cart.filter((item) => item.id !== itemId);

        try {
            const cartRef = doc(db, "userCart", currentUser.email);
            await setDoc(cartRef, { items: updatedCart });
            setCart(updatedCart);
            calculateTotalPrice(updatedCart, selectedItems);
        } catch (error) {
            console.error("Error removing item from cart:", error);
        } finally {
            setLoadingItem(null); // Clear loading state
        }
    };

    const handleQuantityChange = async (itemId, change) => {
        if (!currentUser) return;

        setLoadingItem(itemId); // Set loading for the specific item
        const updatedCart = cart.map((item) =>
            item.id === itemId
                ? { ...item, quantity: Math.max(1, (item.quantity || 1) + change) }
                : item
        );

        try {
            const cartRef = doc(db, "userCart", currentUser.email);
            await setDoc(cartRef, { items: updatedCart });
            setCart(updatedCart);
            calculateTotalPrice(updatedCart, selectedItems);
        } catch (error) {
            console.error("Error updating item quantity:", error);
        } finally {
            setLoadingItem(null); // Clear loading state
        }
    };

    const handleItemSelect = (itemId) => {
        setSelectedItems((prevSelectedItems) =>
            prevSelectedItems.includes(itemId)
                ? prevSelectedItems.filter((id) => id !== itemId)
                : [...prevSelectedItems, itemId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]); // Deselect all
        } else {
            setSelectedItems(cart.map((item) => item.id)); // Select all
        }
        setSelectAll(!selectAll);
    };

    const calculateTotalPrice = (cartItems, selectedItems) => {
        const total = cartItems
            .filter((item) => selectedItems.includes(item.id))
            .reduce((acc, item) => {
                const price = typeof item.price === "number" ? item.price : parseFloat(item.price);
                return acc + (isNaN(price) ? 0 : price * (item.quantity || 1));
            }, 0);
        setTotalPrice(total);
    };

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">You're not logged in</h2>
                    <p className="text-gray-600 mb-6">Please log in to view and manage your cart items.</p>
                    <button
                        onClick={handleSignIn}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-100 via-gray-50 to-white min-h-screen">
            <div className="max-w-screen-lg mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Cart Section */}
                <div className="lg:col-span-2 bg-white shadow-xl rounded-lg p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2 sm:pb-4">
                        Cart ({cart.length})
                    </h2>

                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="h-4 w-4 sm:h-5 sm:w-5 accent-pink-500 cursor-pointer"
                        />
                        <label className="text-sm sm:text-base font-medium text-gray-700">
                            Select All
                        </label>
                    </div>

                    {cart.length === 0 ? (
                        <p className="text-base sm:text-lg text-gray-500 text-center">
                            Your cart is empty.
                        </p>
                    ) : (
                        <ul className="space-y-4 sm:space-y-6">
                            {cart.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
                                >
                                    {/* Item Details */}
                                    <div className="flex items-center gap-3 sm:gap-4 mb-4 md:mb-0">
                                        <img
                                            src={item.image || "/default-item.png"}
                                            alt={item.title}
                                            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-300"
                                        />
                                        <div>
                                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                Rs. {item.price} x {item.quantity || 1}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleItemSelect(item.id)}
                                            className="h-4 w-4 sm:h-5 sm:w-5 accent-pink-500 cursor-pointer"
                                        />
                                        {loadingItem === item.id ? (
                                            <div className="animate-spin border-2 border-pink-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 border-t-transparent"></div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, -1)}
                                                    className="px-1 sm:px-2 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-all text-xs sm:text-sm"
                                                >
                                                    -
                                                </button>
                                                <span className="text-xs sm:text-sm md:text-base font-medium">
                                                    {item.quantity || 1}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, 1)}
                                                    className="px-1 sm:px-2 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-all text-xs sm:text-sm"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="px-1 sm:px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all text-xs sm:text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Summary Section */}
                <div className="bg-white shadow-xl rounded-lg p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-2 sm:pb-4">
                        Summary
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 mb-4">
                        Total items:{" "}
                        <span className="font-semibold">{selectedItems.length}</span>
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                        Rs. {totalPrice}
                    </p>

                    <Link
                        to="/checkout"
                        state={{
                            selectedItems: cart.filter((item) => selectedItems.includes(item.id)),
                            productImage: cart
                                .filter((item) => selectedItems.includes(item.id))
                                .map((item) => item.image),
                            totalAmount: totalPrice,
                        }}
                    >
                        <button
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={selectedItems.length === 0}
                        >
                            Checkout
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );


};

export default CartPage;

