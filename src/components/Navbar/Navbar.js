import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase"; // Your firebase configuration file
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FaUserCircle } from 'react-icons/fa'; // Import a default user icon from react-icons
import image1 from '../../assets/images/logo.png';
import './Navbar.css';

function Navbar() {

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // User state to manage logged-in user info
  const [profilePic, setProfilePic] = useState("/default-profile.png"); // Default profile picture
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // To toggle the dropdown visibility
  const [userRole, setUserRole] = useState("user"); // State to store the user's role
  const [isHidden, setIsHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);

  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const navRef = useRef(null); // Ref for entire navbar
  const dropdownRef = useRef(null); // Ref for dropdown container

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Close the dropdown if clicked outside
        setIsOpen(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !navRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isScrollingUp = prevScrollPos > currentScrollPos;

      setIsHidden(!isScrollingUp && currentScrollPos > 50);
      setPrevScrollPos(currentScrollPos);
      setIsDropdownOpen(false);
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      // Cleanup the event listener on component unmount or when dropdown closes
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDropdownOpen, prevScrollPos]);


  const closeMenu = () => setIsOpen(false);



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
        // Reload the page to reflect changes
        window.location.reload(); // This will refresh the website
      }

      setUser(user); // Update the user state with the logged-in user's info
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
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
            setUserRole(userDocSnap.data().role || "user"); // Set user role
          }
        };
        fetchUserProfilePic();
      } else {
        setUser(null); // Reset user when logged out
        setUserRole("user"); // Reset role
      }
    });
    return unsubscribe;
  }, [auth]);

  return (
    // <nav className="bg-gray-800">
     <nav
      className={`navbar fixed top-0 left-0 w-full bg-gray-800 z-50 transition-transform duration-300 ${isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
    >
      <div className="w-full px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center whitespace-nowrap">
          <Link to="/" className="flex items-center">
            <img
              src={image1} // Replace with your actual image source
              alt="BAG SOCIETY Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mr-2"
            />
            <span className="text-white text-lg sm:text-xl lg:text-2xl font-bold">
              BAG SOCIETY
            </span>
          </Link>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden ml-auto">
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


        {/* Full-Screen Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={closeMenu}
          />
        )}


        {/* Profile Icon Mobile */}
        {user && (
          <div className="md:hidden ml-4">
            <img
              src={profilePic} // Profile pic for mobile
              alt="Profile"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg text-black z-50">
                <Link to="/setting">
                  <button
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    onClick={() => {
                      closeMenu();
                      setIsDropdownOpen(false);
                    }}
                  >
                    View Profile
                  </button>
                </Link>

                <Link to="/MyOrders">
                  <button
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    onClick={() => {
                      closeMenu();
                      setIsDropdownOpen(false);
                    }}
                  >
                    My Orders
                  </button>
                </Link>

                {userRole === "admin" && (
                  <Link to="/admin-dashboard">
                    <button
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                      onClick={() => {
                        closeMenu();
                        setIsDropdownOpen(false);
                      }}
                    >
                      Admin Dashboard
                    </button>
                  </Link>
                )}

                <button
                  onClick={() => {
                    auth.signOut();
                    setUser(null); // Set user state to null when logging out
                    setIsDropdownOpen(false); // Close the dropdown
                    navigate("/");
                  }}
                  className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <ul
          className={`md:flex md:items-center md:justify-end absolute md:static top-16 left-0 w-full bg-gray-800 md:bg-transparent z-20 transition-all duration-300 p-0 ${isOpen ? "block" : "hidden"
            } md:ml-auto md:mr-0 mx-auto text-center md:text-left`}
        >
          <li className="border-b border-gray-700 md:border-none">
            <Link
              to="/"
              className="block py-2 px-4 text-white hover:text-blue-400"
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li className="border-b border-gray-700 md:border-none">
            <Link
              to="/all-products"
              className="block py-2 px-4 text-white hover:text-blue-400"
              onClick={closeMenu}
            >
              Products
            </Link>
          </li>
          <li className="border-b border-gray-700 md:border-none">
            <Link
              to="/my-cart"
              className="block py-2 px-4 text-white hover:text-blue-400"
              onClick={closeMenu}
            >
              Cart
            </Link>
          </li>
          <li className="border-b border-gray-700 md:border-none">
            <Link
              to="/contact-us"
              className="block py-2 px-4 text-white hover:text-blue-400"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Profile Icon outside the navigation list, not inside the hamburger menu */}
        {/* Visible only on larger screens */}
        <div className="hidden md:flex md:items-center">
          {user ? (
            <div className="relative">
              <img
                src={profilePic} // Use the profile picture fetched from Firestore
                alt="Profile"
                className="w-12 h-10 rounded-full cursor-pointer"
                // onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle the dropdown menu
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              />
              {/* Dropdown Menu for Profile */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg text-black z-50">
                  <Link
                    to="/setting"
                  >
                    <button onClick={() => {
                      closeMenu();
                      setIsDropdownOpen(false);
                    }}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      View Profile
                    </button>
                  </Link>

                  <Link
                    to="/MyOrders"
                  >
                    <button onClick={() => {
                      closeMenu();
                      setIsDropdownOpen(false);
                    }}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      My Orders
                    </button>
                  </Link>

                  {userRole === "admin" && ( // Show Admin Dashboard for admins only
                    <Link to="/admin-dashboard">
                      <button onClick={() => {
                        closeMenu();
                        setIsDropdownOpen(false);
                      }}
                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
                        Admin Dashboard
                      </button>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      auth.signOut(); // Sign out from auth
                      setUser(null); // Set user state to null when logging out
                      setIsDropdownOpen(false); // Close the dropdown
                      navigate("/");
                      closeMenu();
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
    </nav >
  );
}

export default Navbar;
