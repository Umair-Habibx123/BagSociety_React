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
      <div className="container mx-auto max-w-screen-xl">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          All Products
        </h2>

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


// import React, { useState, useEffect } from "react";
// import { getDocs, collection } from "firebase/firestore";
// import ProductCard from "../ProductCard/ProductCard.js";
// import { db } from "../../firebase";

// const AllProductsPage = () => {
//   const itemsPerPage = 10; // Number of items per page
//   const [currentPage, setCurrentPage] = useState(1);
//   const [products, setProducts] = useState([]); // Store fetched products
//   const [loading, setLoading] = useState(true); // Track loading state

//   // Fetch products from Firestore
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true); // Set loading to true at the start of the fetch
//       try {
//         const productsSnapshot = await getDocs(collection(db, "products"));
//         const productsList = productsSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         // Sort products descending based on the document ID in descending order (e.g., product10, product9, ..., product1)
//         const sortedProducts = productsList.sort((a, b) => {
//           const idA = a.id.replace(/[^0-9]/g, ""); // Extract the numeric part of the ID
//           const idB = b.id.replace(/[^0-9]/g, ""); // Extract the numeric part of the ID
//           return parseInt(idB) - parseInt(idA); // Sort in descending order
//         });

//         setProducts(sortedProducts); // Set the sorted products state
//       } catch (error) {
//         console.error("Error fetching products: ", error);
//       } finally {
//         setLoading(false); // Set loading to false after the fetch completes
//       }
//     };

//     fetchProducts();
//   }, []);

//   // Calculate the indices for the products to display on the current page
//   const indexOfLastProduct = currentPage * itemsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
//   const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

//   // Change page
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Calculate total pages
//   const totalPages = Math.ceil(products.length / itemsPerPage);

//   return (
//     <section className="py-12 px-6 bg-gray-50 w-full">
//       <div className="container mx-auto max-w-screen-xl">
//         {/* Header */}
//         <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
//           All Products
//         </h2>

//         {/* Loading Indicator */}
//         {loading ? (
//           <div className="flex justify-center items-center h-48">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
//           </div>
//         ) : (
//           <>
//             {/* Products Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
//               {currentProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="group transition-transform transform hover:scale-105 duration-300"
//                 >
//                   <ProductCard product={product} />
//                 </div>
//               ))}
//             </div>

//             {/* Pagination Controls */}
//             <div className="mt-12 flex justify-center">
//               <nav aria-label="Pagination Navigation">
//                 <ul className="flex flex-wrap justify-center gap-3 md:gap-4">
//                   {/* Previous Page Button */}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       className={`px-5 py-3 md:px-6 md:py-3 rounded-full shadow-md transition-all duration-300 transform ${currentPage === 1
//                           ? "bg-gray-400 text-white cursor-not-allowed"
//                           : "bg-purple-600 text-white hover:scale-110 hover:bg-purple-700"
//                         }`}
//                       disabled={currentPage === 1}
//                     >
//                       &#8592; Previous
//                     </button>
//                   </li>

//                   {/* Page Numbers */}
//                   {Array.from({ length: totalPages }, (_, index) => (
//                     <li key={index}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-4 py-2 md:px-5 md:py-3 rounded-full font-semibold transition-all duration-300 transform ${currentPage === index + 1
//                             ? "bg-purple-600 text-white scale-110 shadow-lg"
//                             : "bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:shadow-md"
//                           }`}
//                       >
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}

//                   {/* Next Page Button */}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage + 1)}
//                       className={`px-5 py-3 md:px-6 md:py-3 rounded-full shadow-md transition-all duration-300 transform ${currentPage === totalPages
//                           ? "bg-gray-400 text-white cursor-not-allowed"
//                           : "bg-purple-600 text-white hover:scale-110 hover:bg-purple-700"
//                         }`}
//                       disabled={currentPage === totalPages}
//                     >
//                       Next &#8594;
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );

// };

// export default AllProductsPage;