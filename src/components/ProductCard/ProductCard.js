import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "../../context/UserContext"; // Assuming you have a context for the user
import { useNavigate } from "react-router-dom"; // Importing useNavigate for programmatic navigation

const ProductCard = ({ product }) => {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // State for the login prompt modal
  const [added, setAdded] = useState(false);
  const [user, setUser] = useState(null); // User state to manage logged-in user info
  const userContext = useUser(); // Get the logged-in user from context
  const [profilePic, setProfilePic] = useState("/default-profile.png"); // Default profile picture
  const [userState, setUserState] = useState(null); // User state to manage logged-in user info
  const [userRole, setUserRole] = useState("user"); // State to store the user's role
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate(); // Initialize the useNavigate hook

  // Fetch user role from Firestore when userContext changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (userContext?.email) {
        try {
          const userRef = doc(db, "users", userContext.email);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role || "user"); // Default role is "user"
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, [userContext]);


  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevents the click event from reaching the card
    if (!userContext) {
      setShowLoginPrompt(true); // Show login prompt modal if not logged in
      return;
    }

    setIsLoading(true); // Set loading state to true
    try {
      const cartRef = doc(db, "userCart", userContext.email);
      const cartDoc = await getDoc(cartRef);

      let updatedCart = [];
      if (cartDoc.exists()) {
        updatedCart = cartDoc.data().items;
      }

      // Check if the product already exists in the cart
      const productIndex = updatedCart.findIndex((item) => item.id === product.id);
      if (productIndex > -1) {
        // If the product exists, increase its quantity
        updatedCart[productIndex].quantity = (updatedCart[productIndex].quantity || 1) + 1;
      } else {
        // Add new product with quantity 1
        updatedCart.push({
          id: product.id,
          title: product.title,
          price: product.discountedPrice,
          image: product.image,
          quantity: 1,
        });
      }

      // Update cart in Firestore
      await setDoc(cartRef, { items: updatedCart });

      setAdded(true);
      setTimeout(() => setAdded(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error("Error adding to cart: ", error);
    }
    finally {
      setIsLoading(false); // Reset loading state
    }
  };


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

  const handleBuyNow = (e) => {
    e.stopPropagation(); // Prevents the click event from reaching the card
    if (!userContext) {
      setShowLoginPrompt(true); // Show login prompt modal if not logged in
      return;
    }

    // Navigate to the Buy Now page with the product details
    navigate("/BuyNow", { state: { product } });
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`, { state: { product } }); // Navigates to product detail
  };

  const isAdmin = userRole === "admin"; // Check if the user is an admin


  return (
    <div className="border border-gray-300 rounded-lg p-4 shadow-lg relative bg-gradient-to-br from-white to-gray-100 hover:shadow-xl transform transition-all duration-300">
      {/* Product Image */}
      <div className="relative w-full h-48 overflow-hidden rounded-lg">
        <img
          onClick={handleCardClick}
          src={isHovered ? product.image2 : product.image}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 ease-in-out ${isHovered ? "scale-105 opacity-90" : "scale-100 opacity-100"
            }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>



      {/* Sale Badge */}
      <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md animate-pulse">
        50% off
      </div>

      {/* Product Info */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-800 h-10 overflow-hidden">
          {product.title}
        </h3>
        <div className="flex items-center mt-2">
          <span className="text-sm text-gray-400 line-through mr-2">
            Rs. {product.originalPrice}
          </span>
          <span className="text-lg text-red-600 font-bold">
            Rs. {product.discountedPrice}
          </span>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="mt-6 flex space-x-3">
        {/* Add to Cart Button */}

        <button
          onClick={handleAddToCart}
          className={`w-full py-2 border border-black text-black text-sm font-medium rounded-md bg-white shadow-md transform transition-all duration-300 ${isAdmin
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100 hover:-translate-y-1 hover:shadow-lg"
            }`}
          disabled={isLoading || added || isAdmin}
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C6.477 0 0 6.477 0 12h4zm2 5.291A7.967 7.967 0 014 12H0c0 2.137.837 4.09 2.209 5.526l1.791-1.235z"
                ></path>
              </svg>
              <span>Adding...</span>
            </span>
          ) : added ? (
            "Added to Cart"
          ) : (
            "Add to Cart"
          )}
        </button>

        {added && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center bg-green-500 text-white px-4 py-2 rounded shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2l4-4m0-6a9 9 0 110 18a9 9 0 010-18z"
              />
            </svg>
            <span>Product added to cart successfully!</span>
          </div>
        )}

        {showLoginPrompt && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center transform scale-105 transition-transform duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">
                Please log in to add items to your cart and continue shopping.
              </p>
              <button
                onClick={() => setShowLoginPrompt(false)} // Close the modal
                className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  handleSignIn();
                  // Redirect to login page (replace with your login logic)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          </div>
        )}

        {/* Buy Now Button */}
        <button
          onClick={handleBuyNow}
          className={`w-full py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-md bg-white shadow-md transform transition-all duration-300 ${isAdmin
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-50 hover:-translate-y-1 hover:shadow-lg"
            }`}
          disabled={isAdmin}
        >
          Buy Now
        </button>
      </div>
    </div>
  );


};

export default ProductCard;
