import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

function AddProduct() {
    const [formData, setFormData] = useState({
        title: "",
        originalPrice: "",
        discountedPrice: "",
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

        if (!formData.title || !formData.originalPrice || !formData.discountedPrice || !formData.image) {
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
            setFormData({
                title: "",
                originalPrice: "",
                discountedPrice: "",
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

            setNextDocName(""); // Recalculate doc name for next product
        } catch (err) {
            console.error("Error adding product:", err);
            setError("Failed to add product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Add New Product</h1>

            {/* Error or Success Message */}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}

            {/* Form */}
            <div className="max-w-lg mx-auto bg-white p-6 rounded shadow-md">
                <input
                    type="text"
                    name="title"
                    placeholder="Product Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border p-2 mb-4 rounded"
                />
                <input
                    type="number"
                    name="originalPrice"
                    placeholder="Original Price"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full border p-2 mb-4 rounded"
                />
                <input
                    type="number"
                    name="discountedPrice"
                    placeholder="Discounted Price"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    className="w-full border p-2 mb-4 rounded"
                />
                <input
                    type="text"
                    name="image"
                    placeholder="Image URL"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full border p-2 mb-4 rounded"
                />
                <div>
                    <h3 className="font-semibold mb-2">Details:</h3>
                    {Object.entries(formData.details).map(([key, value]) => (
                        <div key={key} className="mb-2">
                            <label className="block text-sm font-medium capitalize">{key}:</label>
                            <input
                                type="text"
                                name={`details.${key}`}
                                placeholder={`Enter ${key}`}
                                value={value}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    ))}
                </div>


                <button
                    onClick={handleAddProduct}
                    className="w-full bg-green-500 text-white p-2 rounded mt-4 hover:bg-green-600"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Product"}
                </button>
            </div>
        </div>
    );
}

export default AddProduct;
