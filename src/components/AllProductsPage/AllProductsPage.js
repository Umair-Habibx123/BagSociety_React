import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import ProductCard from "../ProductCard/ProductCard.js";
import { db } from "../../firebase";

const AllProductsPage = () => {
  const itemsPerPage = 10; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]); // Store fetched products

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

  // Calculate the indices for the products to display on the current page
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <section className="py-8 px-4 bg-gray-100 w-full">
      <div className="container mx-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-8">All Products</h2>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-center">
          <nav>
            <ul className="flex space-x-2">
              {/* Previous Page Button */}
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
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
                    className={`px-4 py-2 border rounded-md ${currentPage === index + 1 ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              {/* Next Page Button */}
              <li>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default AllProductsPage;
