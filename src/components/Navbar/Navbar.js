import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase"; // Your firebase configuration file
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FaUserCircle } from 'react-icons/fa'; // Import a default user icon from react-icons
import image1 from '../../assets/images/WhatsApp Image 2024-11-22 at 17.14.26_aa94cea3.jpg';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // User state to manage logged-in user info
  const [profilePic, setProfilePic] = useState("/default-profile.png"); // Default profile picture
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // To toggle the dropdown visibility

  const auth = getAuth();
  const provider = new GoogleAuthProvider();


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

    // Function to close the hamburger menu when a link is clicked
    const closeMenu = () => {
      setIsOpen(false); // Close the hamburger menu
    };


  // Listen for authentication state changes (check if the user is logged in or not)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set user when logged in
        // Fetch user profile picture from Firestore if not already set
        const fetchUserProfilePic = async () => {
          const userDocRef = doc(db, "users", currentUser.email);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setProfilePic(userDocSnap.data().profilePic || "/default-profile.png");
          }
        };
        fetchUserProfilePic();
      } else {
        setUser(null); // Reset user when logged out
      }
    });
    return unsubscribe;
  }, [auth]);

  return (
    <nav className="bg-gray-800">
      <div className="w-full px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center whitespace-nowrap">
          <Link to="/" className="flex items-center">
            <img
              src={image1} // Replace with your actual image source
              alt="BAG SOCIETY Logo"
              className="w-12 h-12 mr-2"
            />
            <span className="text-white text-2xl font-bold">BAG SOCIETY</span>
          </Link>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden ml-auto"> {/* Visible only on mobile screens */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Profile Icon Mobile */}
        {user && (
          <div className="md:hidden ml-4"> {/* Only visible on mobile */}
            <img
              src={profilePic} // Profile pic for mobile
              alt="Profile"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle the dropdown menu
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg text-black z-50"  onClick={closeMenu}>
                {/* Mobile dropdown options */}
                <Link
                  to="/setting"
                >
                  <button className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"  onClick={closeMenu}>
                    View Profile
                  </button>
                </Link>

                <Link
                  to="/MyOrders"
                >
                  <button
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"  onClick={closeMenu}>
                    My Orders
                  </button>
                </Link>

                <button
                  onClick={() => {
                    auth.signOut();
                    setUser(null); // Set user state to null when logging out
                    setIsDropdownOpen(false); // Close the dropdown
                  }}
                  className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100" >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <ul
          className={`md:flex md:items-center md:justify-end pr-[7px] md:space-x-6 absolute md:static top-16 left-0 w-full bg-gray-800 md:bg-transparent z-10 md:z-auto transition-all duration-300 p-0 ${isOpen ? "block" : "hidden"
            } md:ml-auto md:mr-0 mx-auto text-center md:text-left`}
        >
          <li className="border-b border-gray-700 md:border-none">
            <Link
              to="/"
              className="block py-2 px-4 text-white hover:text-blue-400" onClick={closeMenu} 
            >
              Home
            </Link>
          </li>
          <li onClick={closeMenu} className="border-b border-gray-700 md:border-none" >
            <Link
              to="/all-products"
              className="block py-2 px-4 text-white hover:text-blue-400"
            >
              Products
            </Link>
          </li>
          <li className="border-b border-gray-700 md:border-none">
            <Link
              to="/my-cart"
              className="block py-2 px-4 text-white hover:text-blue-400" onClick={closeMenu} 
            >
              Cart
            </Link>
          </li>
          <li className="border-b border-gray-700 md:border-none">
            <Link
              to="/contact-us"
              className="block py-2 px-4 text-white hover:text-blue-400" onClick={closeMenu} 
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Profile Icon outside the navigation list, not inside the hamburger menu */}
        <div className="hidden md:flex md:items-center"> {/* Visible only on larger screens */}
          {user ? (
            <div className="relative">
              <img
                src={profilePic} // Use the profile picture fetched from Firestore
                alt="Profile"
                className="w-12 h-10 rounded-full cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle the dropdown menu
              />
              {/* Dropdown Menu for Profile */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg text-black z-50">
                  <Link
                    to="/setting"
                  >
                    <button
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      View Profile
                    </button>
                  </Link>

                  <Link
                    to="/MyOrders"
                  >
                    <button
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      My Orders
                    </button>
                  </Link>

                  <button
                    onClick={() => {
                      auth.signOut(); // Sign out from auth
                      setUser(null); // Set user state to null when logging out
                      setIsDropdownOpen(false); // Close the dropdown
                      window.location.reload(); // Refresh the page to clear any remaining data
                    }}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              <FaUserCircle className="w-8 h-8" /> {/* Default user icon */}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
