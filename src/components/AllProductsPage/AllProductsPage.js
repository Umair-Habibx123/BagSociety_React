import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import ProductCard from "../ProductCard/ProductCard.js";
import { db } from "../../firebase";

const AllProductsPage = () => {
  const itemsPerPage = 10; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]); // Store fetched products
  const [loading, setLoading] = useState(true); // Track loading state
  const [searchTerm, setSearchTerm] = useState(""); // Store the search term



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

  // Filter products based on search term
  const filteredProducts = searchTerm
    ? products.filter((product) =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : products;

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);


  return (
    <section className="py-12 px-6 bg-gray-50 w-full">
      <div className="container mx-auto max-w-screen-xl">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          All Products
        </h2>



        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-lg md:max-w-2xl">
            {/* Magnifying Glass Icon */}
            <span className="absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="w-6 h-6 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 4a7 7 0 100 14 7 7 0 000-14zm0 0l6 6"
                />
              </svg>
            </span>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search for a product..."
              className="block w-full pl-12 pr-6 py-4 text-lg md:text-xl text-gray-700 placeholder-gray-400 border-2 border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 sm:text-sm md:sm:text-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Clear Button */}
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
              >
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>



        {filteredProducts.length === 0 && !loading && (
          <div className="text-center text-gray-600 mt-12">
            No products found for "{searchTerm}".
          </div>
        )}


        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Products Grid */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="group transition-transform transform hover:scale-105 duration-300 ease-in-out"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-12 flex justify-center">
              <nav aria-label="Pagination Navigation">
                <ul className="flex flex-wrap justify-center gap-3 md:gap-4">
                  {/* Previous Page Button */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      className={`px-5 py-3 md:px-6 md:py-3 rounded-full shadow-md transition-all duration-300 ease-in-out transform ${currentPage === 1
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-purple-600 text-white hover:scale-110 hover:bg-purple-700"
                        }`}
                      disabled={currentPage === 1}
                    >
                      &#8592; Previous
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 md:px-5 md:py-3 rounded-full font-semibold transition-all duration-300 ease-in-out transform ${currentPage === index + 1
                          ? "bg-purple-600 text-white scale-110 shadow-lg"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:shadow-md"
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
                      className={`px-5 py-3 md:px-6 md:py-3 rounded-full shadow-md transition-all duration-300 ease-in-out transform ${currentPage === totalPages
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-purple-600 text-white hover:scale-110 hover:bg-purple-700"
                        }`}
                      disabled={currentPage === totalPages}
                    >
                      Next &#8594;
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