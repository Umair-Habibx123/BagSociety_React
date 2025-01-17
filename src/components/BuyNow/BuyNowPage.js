import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../../context/UserContext';


const BuyNowPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(product?.discountedPrice || 0);
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

  const user = useUser();

  useEffect(() => {
    if (!product) {
      navigate("/my-cart");
    } else {
      setTotalAmount(
        product?.discountedPrice ? product.discountedPrice * quantity : 0
      );
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
            } else {
              setAddress(null);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
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

  const handleCheckout = async () => {
    if (!address) {
      alert("Please provide your address before proceeding.");
      return;
    }

    // Create the order data
    const orderData = {
      product: {
        title: product?.title || "Unnamed product", // Match with `CartPage`
        price: parseFloat(product?.discountedPrice) || 0,
        quantity: quantity || 1,
        total: (parseFloat(product?.discountedPrice) * quantity).toFixed(2),
        image: product?.image || "", // Include product image
      },
      totalAmount: totalAmount.toFixed(2),
      shippingAddress: address,
      paymentMethod: "Cash on Delivery", // or dynamic if needed
    };

    console.log("Order data being saved:", orderData); // Debugging log

    try {

      navigate("/checkout", {
        state: {
          selectedItems: [orderData.product], // Pass the product details as an array
          totalAmount: parseFloat(orderData.totalAmount), // Total amount
          shippingAddress: orderData.shippingAddress, // Address
          productImage: [orderData.product.image], // Wrap the single image in an array
        },
      });

    } catch (error) {
      console.error("Error navigating to checkout page:", error);
      alert("Failed to proceed to checkout. Please try again.");
    }
  };

  const increaseQuantity = () => {
    if (product && product.discountedPrice) {
      setQuantity((prevQuantity) => {
        const updatedQuantity = prevQuantity + 1;
        setTotalAmount((product.discountedPrice || 0) * updatedQuantity);
        return updatedQuantity;
      });
    }
  };

  const decreaseQuantity = () => {
    if (product && product.discountedPrice && quantity > 1) {
      setQuantity((prevQuantity) => {
        const updatedQuantity = prevQuantity - 1;
        setTotalAmount((product.discountedPrice || 0) * updatedQuantity);
        return updatedQuantity;
      });
    }
  };


  return (
    <div className="p-6 sm:p-8 lg:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8 transition-transform transform hover:scale-105 hover:shadow-xl duration-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Buy Now</h2>

        {/* Product Details */}
        <div className="mb-6 bg-gray-100 p-4 rounded-lg shadow-md animate__animated animate__fadeIn">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Product Details</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <img
              src={product?.image}
              alt={product?.title}
              className="w-40 h-40 object-cover rounded-md transition-all transform hover:scale-105 duration-200"
            />
            <div className="flex-1">
              <p className="text-base text-gray-800 font-semibold">{product?.title}</p>
              <p className="text-sm text-gray-600">Price: Rs. {product?.discountedPrice}</p>
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={decreaseQuantity}
                  className="p-2 bg-gray-300 rounded-lg text-lg hover:bg-gray-400"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="p-2 bg-gray-300 rounded-lg text-lg hover:bg-gray-400"
                >
                  +
                </button>
              </div>
              <p className="mt-2 text-gray-800 font-semibold">Total Price: Rs. {Number(totalAmount).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Shipping Address</h3>
          <div className="p-4 border rounded-lg bg-gray-100 transition-all hover:scale-105 duration-300">
            {isAddressLoading ? (
              <p className="text-sm text-gray-800">Loading address...</p>
            ) : address ? (
              <div>
                <p className="text-sm text-gray-800">{address}</p>
                <p
                  onClick={handleChangeAddress}
                  className="text-blue-600 text-sm cursor-pointer mt-2 hover:text-blue-500 transition-all"
                >
                  Change Address
                </p>
              </div>
            ) : (
              <p
                onClick={() => setIsAddressFormVisible(true)}
                className="text-blue-600 text-center cursor-pointer hover:text-blue-500 transition-all"
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
                  className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Country</option>
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
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Save Address
              </button>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment Method</h3>
          <div className="bg-gray-100 p-4 rounded-lg transition-all hover:scale-105 duration-300">
            <label className="flex items-center space-x-3">
              <input type="radio" checked readOnly className="form-radio h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-800">Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handleCheckout}
          className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
        >
          Place Order
        </button>
      </div>
    </div>
  );

};

export default BuyNowPage;
