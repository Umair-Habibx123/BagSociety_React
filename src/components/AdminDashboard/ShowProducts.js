import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

function ShowProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsRef = collection(db, "products");
                const snapshot = await getDocs(productsRef);
                setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Open edit modal
    const handleEditClick = (product) => {
        setEditingProduct(product.id);
        setFormData({ ...product });
    };

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

    // Update product
    const handleUpdate = async () => {
        if (!formData.title || !formData.originalPrice || !formData.discountedPrice || !formData.image) {
            setError("Please input every field");
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
            await updateDoc(doc(db, "products", editingProduct), formData);
            setProducts((prev) =>
                prev.map((p) => (p.id === editingProduct ? { ...p, ...formData } : p))
            );
            setEditingProduct(null);
        } catch (err) {
            setError("Failed to update product.");
            console.error(err);
        }
    };

    // Confirm delete product
    const handleDeleteClick = (productId) => {
        setDeleteConfirm(productId);
    };

    // Delete product
    // const handleDelete = async () => {
    //     setDeleting(true);
    //     try {
    //         await deleteDoc(doc(db, "products", deleteConfirm));
    //         setProducts((prev) => prev.filter((product) => product.id !== deleteConfirm));
    //         setSuccessMessage("Product deleted successfully!");
    //     } catch (err) {
    //         console.error("Error deleting product:", err);
    //     } finally {
    //         setDeleting(false);
    //         setDeleteConfirm(null);
    //     }
    // };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            // Delete the product from the "products" collection
            await deleteDoc(doc(db, "products", deleteConfirm));

            // Remove the product from all user carts
            const userCartCollection = collection(db, "userCart");
            const userCartSnapshot = await getDocs(userCartCollection);

            const batchUpdates = [];

            userCartSnapshot.forEach(async (userDoc) => {
                const userData = userDoc.data();

                if (userData.items) {
                    const updatedItems = userData.items.filter((item) => item.id !== deleteConfirm);

                    // If the items array has been updated, create an update for this user's cart
                    if (updatedItems.length !== userData.items.length) {
                        const userCartRef = doc(db, "userCart", userDoc.id);
                        batchUpdates.push(updateDoc(userCartRef, { items: updatedItems }));
                    }
                }
            });

            // Wait for all updates to complete
            await Promise.all(batchUpdates);

            // Update state and success message
            setProducts((prev) => prev.filter((product) => product.id !== deleteConfirm));
            setSuccessMessage("Product deleted successfully from the store and all user carts!");
        } catch (err) {
            console.error("Error deleting product:", err);
        } finally {
            setDeleting(false);
            setDeleteConfirm(null);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Manage Products</h1>

            {/* Success Message */}
            {successMessage && (
                <div className="text-green-500 text-center mb-4">
                    {successMessage}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <p className="text-center">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="relative p-4 bg-white rounded shadow-md hover:shadow-lg transition"
                        >
                            <FaEdit
                                className="absolute top-3 right-10 text-gray-600 hover:text-gray-800 cursor-pointer"
                                onClick={() => handleEditClick(product)}
                            />
                            <FaTrash
                                className="absolute top-3 right-3 text-red-600 hover:text-red-800 cursor-pointer"
                                onClick={() => handleDeleteClick(product.id)}
                            />
                            <img
                                src={product.image || "https://via.placeholder.com/150"}
                                alt={product.title}
                                className="w-32 h-32 object-cover mx-auto mb-4"
                            />
                            <h3 className="text-lg font-semibold text-center mb-2">
                                {product.title}
                            </h3>
                            <p className="text-sm text-gray-600 text-center">
                                <strong>Original Price:</strong> Rs. {product.originalPrice}
                            </p>
                            <p className="text-sm text-gray-500 text-center">
                                <strong>Discounted Price:</strong> Rs. {product.discountedPrice}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
                        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                        <p className="mb-6">Are you sure you want to delete this product?</p>
                        {deleting ? (
                            <p className="text-blue-500 mb-4">Deleting...</p>
                        ) : (
                            <div className="flex justify-center space-x-4">
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    onClick={handleDelete}
                                >
                                    Confirm
                                </button>
                                <button
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                    onClick={() => setDeleteConfirm(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
                        {error && <p className="text-red-500 mb-2">{error}</p>}

                        <Tabs>
                            <TabList>
                                <Tab>General</Tab>
                                <Tab>Details</Tab>
                            </TabList>

                            {/* General Tab */}
                            <TabPanel>
                                <div className="mb-3">
                                    <label className="block text-gray-700 font-semibold mb-1">
                                        Product Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Product Title"
                                        value={formData.title || ""}
                                        onChange={handleInputChange}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 font-semibold mb-1">
                                        Original Price
                                    </label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        placeholder="Original Price"
                                        value={formData.originalPrice || ""}
                                        onChange={handleInputChange}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 font-semibold mb-1">
                                        Discounted Price
                                    </label>
                                    <input
                                        type="number"
                                        name="discountedPrice"
                                        placeholder="Discounted Price"
                                        value={formData.discountedPrice || ""}
                                        onChange={handleInputChange}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 font-semibold mb-1">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        name="image"
                                        placeholder="Image URL"
                                        value={formData.image || ""}
                                        onChange={handleInputChange}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </TabPanel>

                            {/* Details Tab */}
                            <TabPanel>
                                {Object.entries(formData.details || {}).map(([key, value]) => (
                                    <div className="mb-3" key={key}>
                                        <label className="block text-gray-700 font-semibold mb-1">
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </label>
                                        <input
                                            type="text"
                                            name={`details.${key}`}
                                            placeholder={key}
                                            value={value}
                                            onChange={handleInputChange}
                                            className="w-full border p-2 rounded"
                                        />
                                    </div>
                                ))}
                            </TabPanel>
                        </Tabs>

                        {/* Actions */}
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                                onClick={handleUpdate}
                            >
                                Save Changes
                            </button>
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                onClick={() => setEditingProduct(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
}

export default ShowProducts;
