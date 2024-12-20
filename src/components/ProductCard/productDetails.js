import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase"; // Make sure the path is correct
import { useUser } from "../../context/UserContext"; // Assuming you have a context for the user
import { db } from "../../firebase"; // Ensure this path is correct

const ProductDetail = () => {
    const { id: productId } = useParams(); // Extract `id` from URL params and rename it as `productId`
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const userContext = useUser(); // Get the logged-in user from context
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState("user"); // State to store the user's role
    const [added, setAdded] = useState(false); // State to track if item is added to cart
    const [showLoginPrompt, setShowLoginPrompt] = useState(false); // State to show login prompt
    const [loadingAddToCart, setLoadingAddToCart] = useState(false); // Loading state for adding to cart
    const navigate = useNavigate(); // To navigate to other pages
    const [profilePic, setProfilePic] = useState("/default-profile.png");
    const [user, setUser] = useState(null); // User state to manage logged-in user info

    const provider = new GoogleAuthProvider();


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

    // Monitor Firebase Auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser); // Set the logged-in user

                // Fetch user's role from Firestore
                const userDocRef = doc(db, "users", currentUser.email);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUserRole(userData.role || "user"); // Set role from Firestore
                } else {
                    console.error("User document does not exist.");
                }

            } else {
                setUser(null); // No user is logged in
            }
        });

        return () => unsubscribe(); // Cleanup the listener
    }, []);

    useEffect(() => {
        if (!productId) {
            console.error("No productId provided");
            setError("No productId provided");
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                console.log("Fetching product:", productId);
                const docRef = doc(db, "products", productId); // Use productId here
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const productData = docSnap.data();
                    // Use the document ID (productId) as the product.id
                    const productWithId = { ...productData, id: productId };

                    console.log("Product data:", productWithId);
                    setProduct(productWithId);
                } else {
                    console.error("Product not found!");
                    setError("Product not found!");
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Failed to fetch product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    // Destructure product details safely, with defaults
    const {
        style = "N/A",
        color = "N/A",
        material = "N/A",
        measurements = "N/A",
        pouchInside = "N/A",
        compartments = "N/A",
        clutchInside = "N/A",
        straps = "N/A",
    } = product.details || {};


    const handleAddToCart = async (e) => {
        e.stopPropagation(); // Prevents the click event from reaching the card
        if (!userContext) {
            setShowLoginPrompt(true); // Show login prompt modal if not logged in
            return;
        }

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
        } catch (error) {
            console.error("Error adding to cart: ", error);
        }
    };

    const handleBuyNow = () => {
        if (!user) {
            setShowLoginPrompt(true); // Show login prompt modal if not logged in
            return;
        }

        // Navigate to the Buy Now page with the product details
        navigate("/BuyNow", { state: { product } });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-gray-800">
            {/* Product Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="flex flex-col items-center md:items-start">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-96 object-cover rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
                        loading="lazy"
                    />
                </div>
                <div className="flex flex-col space-y-6">
                    <h1 className="text-4xl font-extrabold text-gray-900">{product.title}</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl text-red-600 font-bold">Rs. {product.discountedPrice}</div>
                        {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">
                                Rs. {product.originalPrice}
                            </span>
                        )}
                    </div>
                    <div className="space-y-4">
                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className={`w-full py-3 font-semibold rounded-lg transition-all duration-300 
                            ${userRole === "admin" || added ?
                                    'bg-gray-300 text-gray-500 cursor-not-allowed' :
                                    'bg-yellow-500 text-white hover:bg-yellow-600 shadow hover:shadow-lg'}`}
                            disabled={added || loadingAddToCart || userRole === "admin"}
                        >
                            {loadingAddToCart ? (
                                <span>Loading...</span>
                            ) : (
                                added ? 'Added to Cart' : 'Add to Cart'
                            )}
                        </button>

                        {/* Buy Now Button */}
                        <button
                            onClick={handleBuyNow}
                            className={`w-full py-3 border-2 font-semibold rounded-lg transition-all duration-300 
                            ${userRole === "admin" ?
                                    'border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed' :
                                    'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow hover:shadow-lg'}`}
                            disabled={userRole === "admin"}
                        >
                            Buy Now
                        </button>
                    </div>

                </div>
            </div>

            {/* Product Details */}
            <div className="border-t pt-8">
                <h2 className="text-2xl font-semibold mb-6">Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base text-gray-700">
                    <div><span className="font-semibold">Style:</span> {style}</div>
                    <div><span className="font-semibold">Color:</span> {color}</div>
                    <div><span className="font-semibold">Material:</span> {material}</div>



                    <div><span className="font-semibold">Measurements:</span> {measurements}</div>
                    <div><span className="font-semibold">Pouch Inside:</span> {pouchInside}</div>
                    <div><span className="font-semibold">Compartments:</span> {compartments}</div>
                    <div><span className="font-semibold">Clutch Inside:</span> {clutchInside}</div>
                    <div><span className="font-semibold">Straps:</span> {straps}</div>
                </div>
            </div>

            {/* Description Section */}
            <div className="pt-8">
                <h2 className="text-2xl font-semibold mb-4">Description:</h2>
                <p className="text-base text-gray-700 leading-relaxed">
                    This bag is designed to blend style and functionality seamlessly. Made from premium-quality faux leather, it offers a luxurious feel while being durable and lightweight.
                    The spacious interior provides ample room for your essentials, and the additional pouches ensure organization is effortless.
                    Whether for casual outings or formal occasions, this bag complements any outfit, making it a versatile addition to your collection.
                </p>
            </div>

            {/* Care Section */}
            <div className="pt-8">
                <h2 className="text-2xl font-semibold mb-4">CARE:</h2>
                <p className="text-base text-gray-700 leading-relaxed">
                    Wipe with a slightly damp cloth to clean your bag. Do not use any chemical or liquid containing chemicals in the cleaning process.
                </p>
            </div>

            {/* Disclaimer Section */}
            <div className="pt-4">
                <h2 className="text-2xl font-semibold mb-4">DISCLAIMER:</h2>
                <p className="text-base text-gray-700 leading-relaxed">
                    Actual colors of the product may vary from the colors being displayed on your device.
                </p>
            </div>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-xl text-center relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowLoginPrompt(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Modal Content */}
                        <p className="text-lg mb-4">Please log in to add items to your cart.</p>
                        <button
                            onClick={handleSignIn}
                            className="mt-4 py-2 px-6 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
                        >
                            Log in with Google
                        </button>
                    </div>
                </div>
            )}

        </div>
    );

};

export default ProductDetail;
