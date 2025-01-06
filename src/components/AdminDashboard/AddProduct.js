import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

function AddProduct() {
    const [formData, setFormData] = useState({
        title: "",
        originalPrice: "",
        discountedPrice: "",
        image2: "https://tse3.mm.bing.net/th?id=OIP.duOtADpRLa1w6xFJ3LFUdgHaI_&pid=ImgDet&w=474&h=575&rs=1",
        image: "",
        details: {
            clutchInside: "",
            color: "",
            compartments: "",
            material: "",
            measurements: "",
            pouchInside: "",
            straps: "",
            style: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [nextDocName, setNextDocName] = useState("");

    // Fetch existing product IDs and calculate the next document name
    useEffect(() => {
        const calculateNextDocName = async () => {
            const productsRef = collection(db, "products");
            const snapshot = await getDocs(productsRef);
            const existingIds = snapshot.docs.map((doc) => doc.id);

            // Find missing or next available product number
            const numbers = existingIds
                .filter((id) => id.startsWith("product"))
                .map((id) => parseInt(id.replace("product", ""), 10))
                .filter((num) => !isNaN(num));

            const sortedNumbers = [...new Set(numbers)].sort((a, b) => a - b);
            let nextNumber = 1;

            for (let i = 0; i < sortedNumbers.length; i++) {
                if (sortedNumbers[i] !== nextNumber) break;
                nextNumber++;
            }

            setNextDocName(`product${nextNumber}`);
        };

        calculateNextDocName();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [key, subkey] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [key]: { ...prev[key], [subkey]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Submit new product
    const handleAddProduct = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        if (!formData.title || !formData.originalPrice || !formData.discountedPrice || !formData.image || !formData.image2) {
            setError("Please input every field");
            setLoading(false);
            return;
        }
        // Check for empty fields in the details object
        const hasEmptyDetails = Object.values(formData.details).some((value) => !value.trim());
        if (hasEmptyDetails) {
            setError("Please input every field in the 'Details' section.");
            setLoading(false);
            return;
        }

        try {
            const newProductRef = doc(db, "products", nextDocName);
            await setDoc(newProductRef, formData);

            setSuccess(`Product added successfully with ID: ${nextDocName}`);
            setFormData((prev) => ({
                ...prev,
                title: "",
                originalPrice: "",
                discountedPrice: "",
                image: "",
                image2: prev.image2, // Retain the default image2 value
                details: {
                    clutchInside: "",
                    color: "",
                    compartments: "",
                    material: "",
                    measurements: "",
                    pouchInside: "",
                    straps: "",
                    style: "",
                },
            }));


            setNextDocName(""); // Recalculate doc name for next product
        } catch (err) {
            console.error("Error adding product:", err);
            setError("Failed to add product.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg transition-transform duration-300 hover:shadow-2xl">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 animate-fadeIn">
                    Add New Product
                </h1>

                {/* Error or Success Message */}
                {error && (
                    <p className="text-red-500 text-center mb-4 animate-pulse">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="text-green-500 text-center mb-4 animate-fadeIn">
                        {success}
                    </p>
                )}

                {/* Form */}
                <div>
                    <input
                        type="text"
                        name="title"
                        placeholder="Product Title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
                    />
                    <input
                        type="number"
                        name="originalPrice"
                        placeholder="Original Price"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
                    />
                    <input
                        type="number"
                        name="discountedPrice"
                        placeholder="Discounted Price"
                        value={formData.discountedPrice}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
                    />
                    <input
                        type="text"
                        name="image"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
                    />

                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Details:</h3>
                        {Object.entries(formData.details).map(([key, value]) => (
                            <div key={key} className="mb-4">
                                <label className="block text-sm font-medium text-gray-600 capitalize">
                                    {key}:
                                </label>
                                <input
                                    type="text"
                                    name={`details.${key}`}
                                    placeholder={`Enter ${key}`}
                                    value={value}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddProduct}
                        className={`w-full bg-green-500 text-white p-3 rounded-lg mt-4 font-semibold text-lg hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add Product"}
                    </button>
                </div>
            </div>
        </div>
    );

}

export default AddProduct;
