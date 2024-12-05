import React, { useState } from "react";
import { db } from "../../firebase";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "../../context/UserContext"; // Assuming you have a context for the user
import { Link, useNavigate } from "react-router-dom"; // Importing useNavigate for programmatic navigation

const ProductCard = ({ product }) => {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // State for the login prompt modal
  const [added, setAdded] = useState(false);
  const [user, setUser] = useState(null); // User state to manage logged-in user info
  const userContext = useUser(); // Get the logged-in user from context
  const [profilePic, setProfilePic] = useState("/default-profile.png"); // Default profile picture
  const [userState, setUserState] = useState(null); // User state to manage logged-in user info

  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevents the click event from reaching the card
    if (!userContext) {
      setShowLoginPrompt(true); // Show login prompt modal if not logged in
      return;
    }

    try {
      const cartRef = doc(db, "userCart", userContext.uid);
      const cartDoc = await getDoc(cartRef);

      let updatedCart = [];
      if (cartDoc.exists()) {
        updatedCart = cartDoc.data().items;
      }

      // Add item to cart
      updatedCart.push({ id: product.id, title: product.title, price: product.discountedPrice, image: product.image });

      // Update cart in Firestore
      await setDoc(cartRef, { items: updatedCart });

      setAdded(true);
    } catch (error) {
      console.error("Error adding to cart: ", error);
    }
  };

  // const handleSignIn = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, provider); // Trigger Google sign-in
  //     const user = result.user; // Get the logged-in user

  //     // Reference to the user's document in Firestore using their email
  //     const userDocRef = doc(db, "users", user.email);

  //     // Check if the user's document already exists
  //     const userDocSnap = await getDoc(userDocRef);

  //     if (userDocSnap.exists()) {
  //       // If the user document exists, load existing data
  //       const userData = userDocSnap.data();
  //       setProfilePic(userData.profilePic || "/default-profile.png"); // Set the profile picture from Firestore
  //     } else {
  //       // If the user document doesn't exist, create a new one
  //       await setDoc(userDocRef, {
  //         username: user.displayName,
  //         email: user.email,
  //         profilePic: user.photoURL || "/default-profile.png", // Set default photo if none exists
  //       });
  //       setProfilePic(user.photoURL || "/default-profile.png"); // Set the profile picture
  //     }

  //     setUser(user); // Update the user state with the logged-in user's info
  //   } catch (error) {
  //     console.error("Error logging in with Google:", error);
  //   }
  // };

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
        setProfilePic(userData.profilePic || "/default-profile.png"); // Set the profile picture from Firestore
      } else {
        // If the user document doesn't exist, create a new one
        await setDoc(userDocRef, {
          username: user.displayName,
          email: user.email,
          profilePic: user.photoURL || "/default-profile.png", // Set default photo if none exists
        });
        setProfilePic(user.photoURL || "/default-profile.png"); // Set the profile picture
      }

      setUser(user); // Update the user state with the logged-in user's info
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


  return (
    <div className="border border-gray-300 rounded-lg p-4 shadow-sm relative bg-white">
      {/* Sale Badge */}
      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
        50% off
      </div>

      {/* Product Image */}
      <img
        onClick={handleCardClick}
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-cover rounded-md"
      />

      {/* Product Info */}
      <div className="mt-4">
        {/* Title Section: Fixed Height */}
        <h3 className="text-sm font-medium text-gray-700 h-10 overflow-hidden">
          {product.title}
        </h3>
        {/* Pricing Section */}
        <div className="flex items-center mt-2">
          <span className="text-sm text-gray-400 line-through mr-2">
            Rs. {product.originalPrice}
          </span>
          <span className="text-sm text-red-600 font-bold">
            Rs. {product.discountedPrice}
          </span>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="mt-4 flex space-x-4">
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2 border border-black text-black text-sm font-medium rounded-md bg-white hover:bg-gray-100"
          disabled={added}
        >
          {added ? "Added to Cart" : "Add to Cart"}
        </button>

        {showLoginPrompt && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-md shadow-lg max-w-md text-center">
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
          className="w-full py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-md bg-white hover:bg-blue-50"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
