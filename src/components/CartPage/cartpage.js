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
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (currentUser) {
            const fetchCart = async () => {
                const cartRef = doc(db, "userCart", currentUser.uid);
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
            const result = await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error logging in with Google:", error);
        }
    };

    const handleQuantityChange = async (itemId, change) => {
        if (!currentUser) return;

        try {
            const cartRef = doc(db, "userCart", currentUser.uid);
            const cartDoc = await getDoc(cartRef);

            if (cartDoc.exists()) {
                const currentItems = cartDoc.data().items || [];
                const updatedItems = currentItems.map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: Math.max(1, (item.quantity || 1) + change) }
                        : item
                );

                await setDoc(cartRef, { items: updatedItems });
                setCart(updatedItems);
                calculateTotalPrice(updatedItems, selectedItems);
            }
        } catch (error) {
            console.error("Error updating item quantity:", error);
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Cart ({cart.length})</h2>

                    {/* Select All Radio Button */}
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="h-5 w-5"
                        />
                        <label className="text-sm md:text-base">Select All</label>
                    </div>

                    {cart.length === 0 ? (
                        <p className="text-lg text-gray-600">Your cart is empty.</p>
                    ) : (
                        <ul className="space-y-4">
                            {cart.map((item) => (
                                <li key={item.id} className="flex justify-between items-center border-b pb-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={item.image || "/default-item.png"}
                                            alt={item.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div>
                                            <h3 className="text-sm md:text-lg font-medium text-gray-800">{item.title}</h3>
                                            <p className="text-xs md:text-sm text-gray-600">
                                                Price: Rs. {item.price} x {item.quantity || 1}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleItemSelect(item.id)}
                                            className="h-5 w-5"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(item.id, -1)}
                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs md:text-sm"
                                        >
                                            -
                                        </button>
                                        <span className="text-xs md:text-sm">{item.quantity || 1}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, 1)}
                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs md:text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Summary</h2>
                    <p className="text-xs md:text-sm text-gray-600 mb-4">Total items: {selectedItems.length}</p>
                    <p className="text-xl md:text-2xl text-gray-800 font-bold mb-4">Total: Rs. {totalPrice}</p>
                    <Link
                        to="/checkout"
                        state={{
                            selectedItems: cart.filter((item) => selectedItems.includes(item.id)),
                            totalAmount: totalPrice,
                        }}
                    >
                        <button
                            className={`w-full px-4 py-2 bg-pink-600 text-white font-bold rounded-md hover:bg-pink-700 disabled:bg-pink-300 disabled:cursor-not-allowed`}
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
