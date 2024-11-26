import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase";
import emailjs from "emailjs-com";

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedItems, totalAmount } = location.state || {};
    const [subtotal, setSubtotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(1.99);
    const [total, setTotal] = useState(totalAmount || 0);
    const [address, setAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(true);
    const [isAddressFormVisible, setIsAddressFormVisible] = useState(false);
    const [newAddress, setNewAddress] = useState({
        country: '',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        postalCode: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState("cash");

    useEffect(() => {
        if (!selectedItems || selectedItems.length === 0) {
            navigate("/cart");
        } else {
            const newSubtotal = selectedItems.reduce((acc, item) => {
                const price = typeof item.price === "number" ? item.price : parseFloat(item.price);
                return acc + (isNaN(price) ? 0 : price * (item.quantity || 1));
            }, 0);
            setSubtotal(newSubtotal);
            setTotal(newSubtotal + shippingFee);
        }
    }, [selectedItems, shippingFee, navigate]);

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                (async () => {
                    try {
                        const docRef = doc(db, "users", user.email);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setAddress(data.address || null);
                        } else {
                            setAddress(null);
                        }
                    } catch (error) {
                        console.error("Error fetching address:", error);
                        setAddress(null);
                    } finally {
                        setIsAddressLoading(false);
                    }
                })();
            } else {
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleChangeAddress = () => {
        setIsAddressFormVisible(true);
        setNewAddress({
            country: address?.country || '',
            firstName: address?.firstName || '',
            lastName: address?.lastName || '',
            address: address?.address || '',
            apartment: address?.apartment || '',
            city: address?.city || '',
            postalCode: address?.postalCode || '',
            phone: address?.phone || ''
        });
    };

    const handleAddressInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveAddress = async () => {
        if (!newAddress.firstName || !newAddress.lastName || !newAddress.address || !newAddress.city || !newAddress.postalCode || !newAddress.phone) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const auth = getAuth();
            const userEmail = auth.currentUser?.email;

            if (!userEmail) {
                alert("User is not authenticated.");
                return;
            }

            const userRef = doc(db, "users", userEmail);
            await setDoc(userRef, {
                address: newAddress
            }, { merge: true });

            setAddress(newAddress);
            setIsAddressFormVisible(false);
            alert("Address saved successfully!");
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address.");
        }
    };

    const handleCheckout = async () => {
        if (!address) {
            alert("Please provide a valid shipping address.");
            return;
        }

        if (!selectedItems || selectedItems.length === 0) {
            alert("No items selected for checkout.");
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                alert("User is not authenticated.");
                return;
            }

            // Fetch user details if needed (e.g., username)
            const userEmail = user.email;
            const userRef = doc(db, "users", userEmail);
            const userDoc = await getDoc(userRef);

            const username = userDoc.exists() ? userDoc.data().username : "Unknown User";

            // Prepare order data
            const orderData = {
                user: {
                    email: userEmail || "Unknown user",
                    username: username || "Unnamed user",
                    address: address || "Address not provided",
                },
                items: selectedItems.map((item) => ({
                    id: item.id || "N/A",
                    name: item.name || "Unnamed item",
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity || 1,
                })),
                subtotal: parseFloat(subtotal) || 0,
                shippingFee: parseFloat(shippingFee) || 0,
                total: parseFloat(total) || 0,
                paymentMethod: paymentMethod || "cash",
                status: "Pending",
                createdAt: new Date().toISOString(),
            };

            console.log("Order data being saved:", orderData); // Debugging log

            // Save order to Firestore
            const ordersRef = doc(db, "orders", `${userEmail}_${Date.now()}`);
            await setDoc(ordersRef, orderData);

            // Prepare email content
            const emailContent = `
                <h1>Order Confirmation</h1>
                <p><strong>User:</strong> ${username} (${userEmail})</p>
                <p><strong>Shipping Address:</strong></p>
                <pre>${JSON.stringify(address, null, 2)}</pre>
                <p><strong>Order Summary:</strong></p>
                <ul>
                    ${selectedItems
                    .map(
                        (item) =>
                            `<li>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</li>`
                    )
                    .join("")}
                </ul>
                <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
                <p><strong>Shipping Fee:</strong> $${shippingFee.toFixed(2)}</p>
                <p><strong>Total:</strong> $${total.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p><strong>Status:</strong> ${orderData.status}</p>
            `;

            // Send confirmation email
            await emailjs.send(
                "service_wng6lvv", // Replace with your service ID
                "template_zmbrbjb", // Replace with your template ID
                {
                    to_email: "umairhabibabc@gmail.com", // Recipient's email
                    user_email: userEmail, // User's email
                    username: username, // User's name
                    order_details: emailContent, // Order details in HTML format
                },
                "kkvWuOpN6HHfFs475" // Replace with your EmailJS user ID
            );

            alert("Order placed successfully!");
            navigate("/order-confirmation", { state: { orderData } });
        } catch (error) {
            console.error("Error processing checkout:", error);
            alert("Failed to place the order. Please try again.");
        }
    };




    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h2>

                {/* Shipping Address */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Shipping Address</h3>
                    <div className="p-4 border rounded-lg bg-gray-100">
                        {isAddressLoading ? (
                            <p className="text-sm text-gray-800">Loading address...</p>
                        ) : address ? (
                            <div>
                                <p className="text-sm text-gray-800">{address}</p>
                                <p
                                    onClick={handleChangeAddress}
                                    className="text-blue-600 text-sm cursor-pointer mt-2"
                                >
                                    Change Address
                                </p>
                            </div>
                        ) : (
                            <p
                                onClick={() => setIsAddressFormVisible(true)}
                                className="text-blue-600 text-center cursor-pointer"
                            >
                                Add New Address
                            </p>
                        )}
                    </div>
                </div>

                {/* Address Form */}
                {isAddressFormVisible && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Enter New Address</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="address"
                                value={newAddress.address}
                                onChange={handleAddressInputChange}
                                className="form-field"
                                placeholder="Enter your address"
                            />
                            <button onClick={handleSaveAddress} className="save-btn">
                                Save Address
                            </button>
                        </div>

                    </div>
                )}

                {/* Order Summary */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Summary</h3>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">Subtotal: ${subtotal.toFixed(2)}</p>
                        <p className="text-sm text-gray-700">Shipping Fee: ${shippingFee.toFixed(2)}</p>
                        <p className="text-lg font-semibold text-gray-800">Total: ${total.toFixed(2)}</p>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment Method</h3>
                    <div>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cash"
                                checked={paymentMethod === "cash"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-2"
                            />
                            Cash on Delivery
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white p-2 rounded-lg mt-4"
                >
                    Place Order
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
