import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust to your Firebase configuration
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useUser } from '../../context/UserContext'; // Adjust to your context for user authentication

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe("pk_test_51QOCsjG75TGzEhkJZOpAO9uh6tnI7wWD64rJoxEqx9y6DZGmiTOPBWvmVuMs5ABGUVdU5GvOsDvGT51aAG196r1S008d0El8NR");

const BuyNowPage = () => {
  const stripe = useStripe();
  const elements = useElements();

  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {}; // Get the product details from navigation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);  // Quantity state
  const [totalAmount, setTotalAmount] = useState(product.discountedPrice);
  const [address, setAddress] = useState(null);
  const [cards, setCards] = useState({});  // To store saved cards
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
  const [cardEntered, setCardEntered] = useState(false);  // Track if card is entered

  const user = useUser();

  useEffect(() => {
    if (!product) {
      navigate("/cart"); // Redirect if product not found
    } else {
      setTotalAmount(product.discountedPrice * quantity); // Update total price based on quantity
    }
  }, [product, quantity, navigate]);

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
              setCards(data.cards || {}); // Fetch saved cards
            } else {
              setAddress(null);
              setCards({}); // No saved cards
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setAddress(null);
            setCards({}); // No saved cards
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

  const handleCheckout = async () => {
    if (!stripe || !elements) {
      console.error("Stripe or Elements not loaded yet");
      return;
    }

    if (!cardEntered) {
      alert("Please enter card details.");
      return;
    }

    if (!address) {
      alert("Please enter your address.");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate the card token
      const { token, error: tokenError } = await stripe.createToken(elements.getElement(CardElement));

      if (tokenError) {
        console.error("Token creation failed:", tokenError.message);
        alert("Failed to create token, please try again.");
        return;
      }

      // Call your backend to create the payment intent
      const response = await fetch("/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      const { clientSecret } = await response.json();

      // Confirm the payment with the client secret and token
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: token.id
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


  const handleCardSelection = () => {
   
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

  // Increment quantity and update total amount
  const increaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  // Decrement quantity and update total amount
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Buy Now</h2>

        {/* Product Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Product Details</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-md mb-4" />
            <p className="text-sm text-gray-800 font-semibold">{product.title}</p>
            <p className="text-sm text-gray-600">Rs. {product.discountedPrice}</p>
            {/* Quantity Controls */}
            <div className="flex gap-4 mt-4">
              <button onClick={decreaseQuantity} className="p-2 bg-gray-300 rounded-lg">-</button>
              <span className="text-lg">{quantity}</span>
              <button onClick={increaseQuantity} className="p-2 bg-gray-300 rounded-lg">+</button>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Shipping Address</h3>
          <div className="p-4 border rounded-lg bg-gray-100">
            {isAddressLoading ? (
              <p className="text-sm text-gray-800">Loading address...</p>
            ) : address ? (
              <div>
                <p className="text-sm text-gray-800">{address}</p>
                <p onClick={handleChangeAddress} className="text-blue-600 text-sm cursor-pointer mt-2">
                  Change Address
                </p>
              </div>
            ) : (
              <p onClick={() => setIsAddressFormVisible(true)} className="text-blue-600 text-center cursor-pointer">
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
                <label className="block text-sm font-medium text-gray-600">First Name</label>
                <input type="text" name="firstName" value={newAddress.firstName} onChange={handleAddressInputChange} className="w-full border-gray-300 p-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Last Name</label>
                <input type="text" name="lastName" value={newAddress.lastName} onChange={handleAddressInputChange} className="w-full border-gray-300 p-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <input type="text" name="address" value={newAddress.address} onChange={handleAddressInputChange} className="w-full border-gray-300 p-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Apartment (Optional)</label>
                <input type="text" name="apartment" value={newAddress.apartment} onChange={handleAddressInputChange} className="w-full border-gray-300 p-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">City</label>
                <input type="text" name="city" value={newAddress.city} onChange={handleAddressInputChange} className="w-full border-gray-300 p-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Postal Code</label>
                <input type="text" name="postalCode" value={newAddress.postalCode} onChange={handleAddressInputChange} className="w-full border-gray-300 p-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                <input type="text" name="phone" value={newAddress.phone} onChange={handleAddressInputChange} className="w-full border-gray-300 p-2 rounded-md" />
              </div>
              <button onClick={handleSaveAddress} className="mt-4 p-2 bg-blue-600 text-white rounded-md">
                Save Address
              </button>
            </div>
          </div>
        )}

        {/* Saved Cards */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Saved Cards</h3>
          {Object.keys(cards).length > 0 ? (
            <div>
              {Object.entries(cards).map(([cardId, cardDetails]) => (
                <div key={cardId} className="bg-gray-100 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">{cardDetails.type} ending in {cardDetails.last4}</p>
                  <button onClick={() => handleCardSelection(cardDetails)} className="text-blue-600 text-sm mt-2">Select this card</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No saved cards.</p>
          )}
        </div>

        {/* Card Input (if no saved card is selected) */}
        {!cardEntered && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Enter Card Details</h3>
            <CardElement />
            <button onClick={handleCheckout} disabled={isProcessing || !stripe || !elements} className="mt-4 p-2 bg-blue-600 text-white rounded-md">
              {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default BuyNowPage;
