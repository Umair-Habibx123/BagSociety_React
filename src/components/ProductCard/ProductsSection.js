
// src/components/ProductsSection.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const ProductsSection = () => {
  const [products, setProducts] = useState([]);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        //   // Sort products ascending based on the document ID (e.g., product1, product2)
        //   const sortedProducts = productsList.sort((a, b) => {
        //     const idA = a.id.replace(/[^0-9]/g, ''); // Extract the numeric part of the ID
        //     const idB = b.id.replace(/[^0-9]/g, ''); // Extract the numeric part of the ID
        //     return parseInt(idA) - parseInt(idB); // Sort numerically
        //   });

        //   setProducts(sortedProducts); // Set the sorted products state
        // } 

        // Sort products descending based on the document ID in descending order (e.g., product10, product9, ..., product1)
        const sortedProducts = productsList.sort((a, b) => {
          const idA = a.id.replace(/[^0-9]/g, ''); // Extract the numeric part of the ID
          const idB = b.id.replace(/[^0-9]/g, ''); // Extract the numeric part of the ID
          return parseInt(idB) - parseInt(idA); // Sort in descending order
        });

        setProducts(sortedProducts); // Set the sorted products state
      }

      catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  // Slice to only show the first 5 products
  const firstFiveProducts = products.slice(0, 5);

  return (
    <section className="py-8 px-4 bg-gray-100 w-full">
      <div className="container mx-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-8">Products</h2>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {firstFiveProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link to="/all-products">
            <button className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800">
              View All
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
