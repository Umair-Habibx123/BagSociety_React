// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaCcAmex, FaCcDiscover, FaCcMastercard, FaCcVisa } from "react-icons/fa";

// const Footer = () => {
//   return (
//     <footer className="bg-gray-900 text-white py-8">
//       <div className="container mx-auto px-4">
//         {/* Footer Columns */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {/* Query Section */}
//           <div>
//             <h2 className="font-bold text-lg mb-4">Put your query at</h2>
//             <p>Whatsapp: +92-310-8026280</p>
//             <p>Email: bagsociety786@gmail.com</p>
//             <p>Business hours: 24/7</p>
//           </div>
//           {/* Shop Section */}
//           <div>
//             <h2 className="font-bold text-lg mb-4">SHOP</h2>
//             <ul className="space-y-2">
//               <li>10.10 SALE</li>
//               <li>Bags</li>
//               <li>Customer Reviews</li>
//               <li>For Bulk Purchase</li>
//               <li>Contact us</li>
//             </ul>
//           </div>
//           {/* Information Section */}
//           <div>
//             <h2 className="font-bold text-lg mb-4">INFORMATION</h2>
//             <ul className="space-y-2">
//               <li>Customer Reviews</li>
//               <li>
//                 <Link
//                   to="/contact-us"
//                 >Contact us</Link></li>
//               <li>Return & Refund Policy</li>
//               <li>About us</li>
//               <li>Shipping Policy</li>
//             </ul>
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="mt-8 border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center">
//           {/* Left */}
//           <p className="text-sm">
//             © 2024, bag-Society® Powered by Bag-Society · Refund policy · Privacy policy
//             · Terms of service · Contact information
//           </p>

//           {/* Social and Payment */}
//           <div className="flex items-center mt-4 md:mt-0 space-x-4">
//             {/* Social Media Icons */}
//             <div className="flex space-x-4">
//               <a href="https://www.facebook.com" className="hover:opacity-75">
//                 <i className="fab fa-facebook-f"></i>
//               </a>
//               <a href="https://www.instagram.com" className="hover:opacity-75">
//                 <i className="fab fa-instagram"></i>
//               </a>

//             </div>
//             {/* Payment Icons */}

//             {/* <div className="flex space-x-4">
//               <FaCcAmex className="h-6 w-6" title="Amex" />
//               <FaCcDiscover className="h-6 w-6" title="Discover" />
//               <FaCcMastercard className="h-6 w-6" title="Mastercard" />
//               <FaCcVisa className="h-6 w-6" title="Visa" />
//             </div> */}

//             <div className="flex space-x-4">
//               <FaCcAmex className="h-6 w-6" title="Amex" style={{ color: "#2E77BC" }} />
//               <FaCcDiscover className="h-6 w-6" title="Discover" style={{ color: "#FF6000" }} />
//               <FaCcMastercard className="h-6 w-6" title="Mastercard" style={{ color: "#EB001B" }} />
//               <FaCcVisa className="h-6 w-6" title="Visa" style={{ color: "#1A1F71" }} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from "react";
import { Link } from "react-router-dom";
import { FaCcAmex, FaCcDiscover, FaCcMastercard, FaCcVisa } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Query Section */}
          <div>
            <h2 className="font-bold text-lg mb-4 text-blue-400">Put your query at</h2>
            <p className="hover:text-blue-400 transition-colors duration-300">
              WhatsApp:{" "}
              <a
                href="https://wa.me/+923108026280"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                +92-310-8026280
              </a>
            </p>
            <p className="hover:text-blue-400 transition-colors duration-300">
              Email:{" "}
              <Link
                to="/contact-us"
                className="text-blue-400 hover:underline"
              >
                bagsociety786@gmail.com
              </Link>
            </p>

            <p className="hover:text-blue-400 transition-colors duration-300">Business hours: 24/7</p>
          </div>
          {/* Shop Section */}
          <div>
            <h2 className="font-bold text-lg mb-4 text-blue-400">SHOP</h2>
            <ul className="space-y-2">
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">10.10 SALE</li>
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Bags</li>
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Customer Reviews</li>
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">For Bulk Purchase</li>
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">
                <Link to="/contact-us">Contact Us</Link>
              </li>
            </ul>
          </div>
          {/* Information Section */}
          <div>
            <h2 className="font-bold text-lg mb-4 text-blue-400">INFORMATION</h2>
            <ul className="space-y-2">
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Customer Reviews</li>
              <li className="hover:text-blue-400 transition-colors duration-300">
                <Link to="/contact-us">Contact Us</Link>
              </li>
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Return & Refund Policy</li>
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">About Us</li>
              <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Shipping Policy</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center">
          {/* Left */}
          <p className="text-sm text-gray-400">
            © 2024, Bag-Society® Powered by Bag-Society · Refund Policy · Privacy Policy
            · Terms of Service · Contact Information
          </p>

          {/* Social and Payment */}
          <div className="flex items-center mt-4 md:mt-0 space-x-6">
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com"
                className="hover:text-blue-500 transition-colors duration-300 text-gray-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.instagram.com"
                className="hover:text-pink-500 transition-colors duration-300 text-gray-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
            {/* Payment Icons */}
            <div className="flex space-x-4">
              <FaCcAmex
                className="h-6 w-6 text-gray-400 hover:text-blue-500 transition-colors duration-300"
                title="Amex"
              />
              <FaCcDiscover
                className="h-6 w-6 text-gray-400 hover:text-orange-500 transition-colors duration-300"
                title="Discover"
              />
              <FaCcMastercard
                className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors duration-300"
                title="Mastercard"
              />
              <FaCcVisa
                className="h-6 w-6 text-gray-400 hover:text-blue-700 transition-colors duration-300"
                title="Visa"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
