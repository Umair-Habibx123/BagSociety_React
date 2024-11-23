import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { db } from "../../firebase"; // Adjust the path to your Firebase config file
import { useUser } from "../../context/UserContext"; // Adjust the path to your context
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe("pk_test_51QOCsjG75TGzEhkJZOpAO9uh6tnI7wWD64rJoxEqx9y6DZGmiTOPBWvmVuMs5ABGUVdU5GvOsDvGT51aAG196r1S008d0El8NR");

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedItems, totalAmount } = location.state || {};
    const [subtotal, setSubtotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(1.99);
    const [total, setTotal] = useState(totalAmount || 0);
    const [address, setAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(true);
    const [isAddressFormVisible, setIsAddressFormVisible] = useState(false); // For toggling the address form visibility
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

    const [cardToken, setCardToken] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);

    const stripe = useStripe();
    const elements = useElements();

    const user = useUser();


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
                            setSavedCards(data.savedCards || []);
                        } else {
                            setAddress(null);
                            setSavedCards([]);
                        }
                    } catch (error) {
                        console.error("Error fetching address:", error);
                        setAddress(null);
                        setSavedCards([]);
                    } finally {
                        setIsAddressLoading(false);
                    }
                })();
            } else {
                console.error("No user logged in");
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
            const userEmail = auth.currentUser.email;
            const userRef = doc(db, "users", userEmail);

            const formattedAddress = `${newAddress.firstName} ${newAddress.lastName}, ${newAddress.address}, ${newAddress.apartment}, ${newAddress.city}, ${newAddress.country}, ${newAddress.postalCode}, Phone: ${newAddress.phone}`;
            await setDoc(userRef, {
                address: formattedAddress
            }, { merge: true });

            setAddress(formattedAddress);
            setIsAddressFormVisible(false);
            alert("Address saved successfully!");
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address.");
        }
    };



    const handleCardSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            console.error("Stripe or Elements not loaded yet");
            return;
        }

        setIsProcessing(true);

        const card = elements.getElement(CardElement);
        if (!card) {
            console.error("CardElement is not rendered properly.");
            setIsProcessing(false);
            return;
        }

        const { token, error } = await stripe.createToken(card);

        if (error) {
            console.error("Error creating token:", error);
            setIsProcessing(false);
            return;
        }

        try {
            const auth = getAuth();
            const userEmail = auth.currentUser.email;
            const userRef = doc(db, "users", userEmail);

            const last4 = token.card.last4;

            await setDoc(
                userRef,
                {
                    paymentToken: token.id,
                    savedCards: [
                        ...savedCards,
                        { token: token.id, last4 }
                    ]
                },
                { merge: true }
            );

            setCardToken(token.id);
            setSavedCards((prevCards) => [...prevCards, { token: token.id, last4 }]);
            console.log("Card token saved successfully.");
            alert("Card added successfully!");
        } catch (error) {
            console.error("Error saving token:", error);
            alert("Failed to save card.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCardSelection = (cardToken) => {
        setSelectedCard(cardToken);
    };

    const handleCheckout = async () => {
        if (!stripe || !elements) {
            console.error("Stripe or Elements not loaded yet");
            return;
        }

        setIsProcessing(true);

        try {
            // Call your backend to create the payment intent
            const response = await fetch("/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: total }),
            });

            const { clientSecret } = await response.json();

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: selectedCard || cardToken
            });

            if (result.error) {
                console.error("Payment failed:", result.error.message);
                alert("Payment failed, please try again.");
            } else if (result.paymentIntent.status === "succeeded") {
                console.log("Payment successful!");
                alert("Payment successful!");
                navigate("/thank-you");
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("There was an issue processing your payment. Please try again.");
        } finally {
            setIsProcessing(false);
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

                {/* Address Form - Show if isAddressFormVisible is true */}
                {isAddressFormVisible && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Enter New Address</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700">Country/Region</label>
                                <select
                                    name="country"
                                    value={newAddress.country}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="">Select Country</option>
                                    {/* Add country options */}
                                    <option value="USA">USA</option>
                                    <option value="Canada">Canada</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={newAddress.firstName}
                                        onChange={handleAddressInputChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={newAddress.lastName}
                                        onChange={handleAddressInputChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Street Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={newAddress.address}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Apartment, suite, etc. (optional)</label>
                                <input
                                    type="text"
                                    name="apartment"
                                    value={newAddress.apartment}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={newAddress.city}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={newAddress.postalCode}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={newAddress.phone}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveAddress}
                                className="bg-blue-600 text-white p-2 rounded-lg mt-4 w-full"
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                )}

                {/* Checkout Summary */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Summary</h3>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">Subtotal: ${subtotal.toFixed(2)}</p>
                        <p className="text-sm text-gray-700">Shipping Fee: ${shippingFee.toFixed(2)}</p>
                        <p className="text-lg font-semibold text-gray-800">Total: ${total.toFixed(2)}</p>
                    </div>
                </div>

                {/* Stripe Payment Form */}
                <form onSubmit={handleCardSubmit} className="mb-6">
                    <CardElement className="p-4 border rounded-lg" />
                    <button
                        type="submit"
                        disabled={isProcessing || !stripe || !elements}
                        className="w-full bg-blue-600 text-white p-2 rounded-lg mt-4"
                    >
                        {isProcessing ? 'Processing...' : 'Add Card and Proceed'}
                    </button>
                </form>

                <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white p-2 rounded-lg mt-4"
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;

