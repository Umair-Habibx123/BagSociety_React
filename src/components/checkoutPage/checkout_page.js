import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase";
import emailjs from "emailjs-com";

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedItems, totalAmount } = location.state || {};
    const [subtotal, setSubtotal] = useState(0);
    // const [shippingFee, setShippingFee] = useState(1.99);
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
    const [isLoading, setIsLoading] = useState(false); // Loading state for checkout process


    useEffect(() => {
        if (!selectedItems || selectedItems.length === 0) {
            navigate("/cart");
        } else {
            const newSubtotal = selectedItems.reduce((acc, item) => {
                const price = typeof item.price === "number" ? item.price : parseFloat(item.price);
                return acc + (isNaN(price) ? 0 : price * (item.quantity || 1));
            }, 0);
            setSubtotal(newSubtotal);
            // setTotal(newSubtotal + shippingFee);
            setTotal(newSubtotal);
        }
        // }, [selectedItems, shippingFee, navigate]);
    }, [selectedItems, navigate]);

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
        // Validation: Check if all fields are filled
        const {
            country,
            firstName,
            lastName,
            address,
            apartment,
            city,
            postalCode,
            phone,
        } = newAddress;

        if (
            !country ||
            !firstName.trim() ||
            !lastName.trim() ||
            !address.trim() ||
            !apartment.trim() ||
            !city.trim() ||
            !postalCode.trim() ||
            !phone.trim()
        ) {
            alert("Please fill out all fields, including the country dropdown.");
            return;
        }

        try {
            const auth = getAuth();
            const userEmail = auth.currentUser.email;
            const userRef = doc(db, "users", userEmail);

            // Save the address as a formatted string
            const formattedAddress = `${firstName} ${lastName}, ${address}, ${apartment}, ${city}, ${country}, ${postalCode}, Phone: ${phone}`;
            await setDoc(userRef, { address: formattedAddress }, { merge: true });

            setAddress(formattedAddress);
            setIsAddressFormVisible(false);
            alert("Address saved successfully!");
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address.");
        }
    };


    const generateOrderDetailsHTML = (items) => {
        return items.map((item) => {
            const name = item.title || "Unnamed item";
            const price = parseFloat(item.price).toFixed(2) || "0.00";
            const quantity = item.quantity || 1;
            const total = (price * quantity).toFixed(2);

            return `Item: ${name}\nPrice: $${price}\nQuantity: ${quantity}\nTotal: $${total}\n---`;
        }).join("\n");
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

        setIsLoading(true); // Set loading to true at the start of checkout process

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                alert("User is not authenticated.");
                setIsLoading(false); // Stop loading on failure
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
                    name: item.title || "Unnamed item",
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity || 1,
                })),
                subtotal: parseFloat(subtotal) || 0,
                total: parseFloat(total) || 0,
                paymentMethod: paymentMethod || "cash",
                status: "Pending",
                createdAt: new Date().toISOString(),
            };

            console.log("Order data being saved:", orderData); // Debugging log

            // Save order to Firestore and get the new order reference
            const newOrderRef = await saveOrderToFirestore(userEmail, orderData);

            // Prepare dynamic variables for the email template
            const emailVariables = {
                order_details: generateOrderDetailsHTML(selectedItems),
                shipping_address: address,
                subtotal: subtotal.toFixed(2),
                total: total.toFixed(2),
                payment_method: paymentMethod,
            };

            console.log("Email variables being passed to EmailJS:", emailVariables); // Log to check if order_details has valid HTML

            // Send confirmation email
                 //     await emailjs.send(
                 //         "service_wng6lvv", // Replace with your service ID
                 //         "template_zmbrbjb", // Replace with your template ID
                  //        emailVariables,
                   //       "kkvWuOpN6HHfFs475" // Replace with your EmailJS user ID
                  //    );

            alert("Order placed successfully!");

            // Navigate to the order confirmation page and pass the order ID and data
            navigate("/order-confirmation", { state: { orderId: newOrderRef.id, orderData } });
        } catch (error) {
            console.error("Error processing checkout:", error);
            alert("Failed to place the order. Please try again.");
        } finally {
            setIsLoading(false); // Stop loading after the checkout process completes
        }
    };




    const saveOrderToFirestore = async (userEmail, orderData) => {
        try {
            // Ensure that userEmail is valid before continuing
            if (!userEmail) {
                throw new Error("User email is required to save the order.");
            }

            // Reference to the user's document in the "users" collection (document named by userEmail)
            const userRef = doc(db, "users", userEmail);

            // Reference to the "orders" subcollection within the user's document
            const ordersRef = collection(userRef, "orders");

            // Create a new document in the "orders" subcollection with a unique ID (using Date.now() as part of the ID)
            const newOrderRef = doc(ordersRef, `${userEmail}_${Date.now()}`);

            // Save the order data in this new order document
            await setDoc(newOrderRef, orderData);

            console.log("Order saved successfully!");

            // Return the new order reference
            return newOrderRef;

        } catch (error) {
            console.error("Error saving order: ", error);
            throw error; // Rethrow the error to be caught in the handleCheckout function
        }
    };







    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h2>

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-center items-center my-4">
                        <div className="loader">Loading...</div> {/* You can use a spinner here */}
                    </div>
                )}

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
                                <label className="block text-sm text-gray-700">Country/Region*</label>
                                <select
                                    name="country"
                                    value={newAddress.country}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="">Select Country</option>
                                    {/* Add country options */}
                                    <option value="PAKISTAN">Pakistan</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-700">First Name*</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={newAddress.firstName}
                                        onChange={handleAddressInputChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-700">Last Name*</label>
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
                                <label className="block text-sm text-gray-700">Address*</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={newAddress.address}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Apartment*</label>
                                <input
                                    type="text"
                                    name="apartment"
                                    value={newAddress.apartment}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-700">City*</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={newAddress.city}
                                        onChange={handleAddressInputChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-700">Postal Code*</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={newAddress.postalCode}
                                        onChange={handleAddressInputChange}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700">Phone Number*</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={newAddress.phone}
                                    onChange={handleAddressInputChange}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <button
                                onClick={handleSaveAddress}
                                className="w-full bg-blue-600 text-white p-2 rounded-lg"
                            >
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
                        {/* <p className="text-sm text-gray-700">Shipping Fee: ${shippingFee.toFixed(2)}</p> */}
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
