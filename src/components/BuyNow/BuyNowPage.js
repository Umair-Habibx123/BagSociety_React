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
      navigate("/cart");
    } else {
      setTotalAmount(product.discountedPrice * quantity);
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

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveAddress = async () => {
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

  const handleCheckout = () => {
    if (!address) {
      alert("Please provide your address before proceeding.");
      return;
    }

    alert("Order placed successfully! Cash on Delivery selected.");
  };

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => {
      const updatedQuantity = prevQuantity + 1;
      setTotalAmount(product.discountedPrice * updatedQuantity);
      return updatedQuantity;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => {
      if (prevQuantity > 1) {
        const updatedQuantity = prevQuantity - 1;
        setTotalAmount(product.discountedPrice * updatedQuantity);
        return updatedQuantity;
      }
      return prevQuantity;
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Buy Now</h2>

        {/* Product Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Product Details</h3>
          <div className="bg-gray-100 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
            <img src={product?.image} alt={product?.title} className="w-40 h-40 object-cover rounded-md" />
            <div>
              <p className="text-base text-gray-800 font-semibold">{product?.title}</p>
              <p className="text-sm text-gray-600">Price: Rs. {product?.discountedPrice}</p>
              <div className="flex items-center gap-4 mt-4">
                <button onClick={decreaseQuantity} className="p-2 bg-gray-300 rounded-lg text-lg">-</button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button onClick={increaseQuantity} className="p-2 bg-gray-300 rounded-lg text-lg">+</button>
              </div>
              <p className="mt-2 text-gray-800 font-semibold">
                Total Price: Rs. {totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Shipping Address</h3>
          <div className="p-4 border rounded-lg bg-gray-100">
            {isAddressLoading ? (
              <p className="text-sm text-gray-800">Loading address...</p>
            ) : address ? (
              <div>
                <p className="text-sm text-gray-800">{address}</p>
                <p onClick={() => setIsAddressFormVisible(true)} className="text-blue-600 text-sm cursor-pointer mt-2">
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

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment Method</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <label className="flex items-center space-x-3">
              <input type="radio" checked readOnly className="form-radio h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-800">Cash on Delivery</span>
            </label>
          </div>
        </div>

        <button onClick={handleCheckout} className="w-full p-2 bg-blue-600 text-white rounded-md">
          Place Order
        </button>
      </div>
    </div>
  );
};

export default BuyNowPage;
