import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import ProductCard from "../ProductCard/ProductCard.js";
import { db } from "../../firebase";

const AllProductsPage = () => {
  const itemsPerPage = 10; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]); // Store fetched products
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Set loading to true at the start of the fetch
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort products descending based on the document ID in descending order (e.g., product10, product9, ..., product1)
        const sortedProducts = productsList.sort((a, b) => {
          const idA = a.id.replace(/[^0-9]/g, ""); // Extract the numeric part of the ID
          const idB = b.id.replace(/[^0-9]/g, ""); // Extract the numeric part of the ID
          return parseInt(idB) - parseInt(idA); // Sort in descending order
        });

        setProducts(sortedProducts); // Set the sorted products state
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false); // Set loading to false after the fetch completes
      }
    };

    fetchProducts();
  }, []);

  // Calculate the indices for the products to display on the current page
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <section className="py-12 px-6 bg-gray-50 w-full">
      <div className="container mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">
          All Products
        </h2>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-10 flex justify-center">
              <nav>
                <ul className="flex space-x-4">
                  {/* Previous Page Button */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md transition-all duration-200 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors duration-300 ${
                          currentPage === index + 1
                            ? "bg-gray-800 text-white border-gray-800"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  {/* Next Page Button */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md transition-all duration-200 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AllProductsPage;


