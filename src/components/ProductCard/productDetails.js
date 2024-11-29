import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Ensure this path is correct
import { useUser } from "../../context/UserContext"; // Corrected import

const ProductDetail = () => {
    const { id: productId } = useParams(); // Extract `id` from URL params and rename it as `productId`
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [added, setAdded] = useState(false); // State to track if item is added to cart
    const [showLoginPrompt, setShowLoginPrompt] = useState(false); // State to show login prompt
    const [loadingAddToCart, setLoadingAddToCart] = useState(false); // Loading state for adding to cart
    const user = useUser(); // Access user context using the useUser hook
    const navigate = useNavigate(); // To navigate to other pages

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

    const handleAddToCart = async () => {
        if (!user) {
            setShowLoginPrompt(true); // Show login prompt if not logged in
            return;
        }

        // Ensure product has necessary fields
        if (!product || !product.id || !product.title || !product.image) {
            console.error("Missing product fields", product);
            setError("Product information is incomplete.");
            return;
        }

        setLoadingAddToCart(true); // Start loading indicator

        try {
            const cartRef = doc(db, "userCart", user.uid);
            const cartDoc = await getDoc(cartRef);

            let updatedCart = [];
            if (cartDoc.exists()) {
                updatedCart = cartDoc.data().items;
            }

            // Add item to cart
            updatedCart.push({
                id: product.id,
                title: product.title,
                price: product.discountedPrice,
                image: product.image
            });

            // Update cart in Firestore
            await setDoc(cartRef, { items: updatedCart });

            setAdded(true); // Update state to reflect that the item has been added
        } catch (error) {
            console.error("Error adding to cart: ", error);
        } finally {
            setLoadingAddToCart(false); // Stop loading indicator
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex flex-col items-center md:items-start">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-96 object-cover rounded-lg shadow-lg"
                        loading="lazy"
                    />
                </div>
                <div className="flex flex-col space-y-4">
                    <h1 className="text-3xl font-extrabold text-gray-900">{product.title}</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-xl text-red-600 font-bold">Rs. {product.discountedPrice}</div>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                Rs. {product.originalPrice}
                            </span>
                        )}
                    </div>
                    <div className="space-y-4">
                        {/* Add to Cart Button with dynamic styling */}
                        <button
                            onClick={handleAddToCart}
                            className={`w-full py-3 font-bold rounded-lg transition-colors 
                                ${added ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                            disabled={added || loadingAddToCart} // Disable the button after adding to the cart or while loading
                        >
                            {loadingAddToCart ? (
                                <span>Loading...</span> // Loading indicator
                            ) : (
                                added ? 'Added to Cart' : 'Add to Cart'
                            )}
                        </button>

                        <button onClick={handleBuyNow}
                            className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="border-t pt-8">
                <h2 className="text-xl font-semibold mb-6">Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div><span className="font-semibold">Style:</span> {style}</div>
                    <div><span className="font-semibold">Color:</span> {color}</div>
                    <div><span className="font-semibold">Material:</span> {material}</div>
                    <div><span className="font-semibold">Measurements:</span> {measurements}</div>
                    <div><span className="font-semibold">Pouch Inside:</span> {pouchInside}</div>
                    <div><span className="font-semibold">Clutch Inside:</span> {clutchInside}</div>
                    <div><span className="font-semibold">Compartments:</span> {compartments}</div>
                    <div><span className="font-semibold">Straps:</span> {straps}</div>
                </div>
            </div>

            {/* Show login prompt if needed */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold text-center">Please Log In</h2>
                        <p className="text-center mb-4">You need to log in to add items to your cart or purchase.</p>
                        <button onClick={() => navigate("/login")} className="w-full py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
                            Log In
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
