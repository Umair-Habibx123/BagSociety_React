import React from "react";
import { Link } from "react-router-dom";
import { FaCcAmex, FaCcDiscover, FaCcMastercard, FaCcVisa } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6 md:px-12">
        {/* Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Query Section */}
          <div>
            <h2 className="font-bold text-xl mb-6 text-blue-400">Put your query at</h2>
            <p className="hover:text-blue-400 transition duration-300">
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
            <p className="hover:text-blue-400 transition duration-300">
              Email:{" "}
              <Link
                to="/contact-us"
                className="text-blue-400 hover:underline"
              >
                bagsociety786@gmail.com
              </Link>
            </p>
            <p className="hover:text-blue-400 transition duration-300 mt-2">Business hours: 24/7</p>
          </div>

          {/* Shop Section */}
          <div>
            <h2 className="font-bold text-xl mb-6 text-blue-400">SHOP</h2>
            <ul className="space-y-4">
              <li className="hover:text-blue-400 transition duration-300 cursor-pointer">10.10 SALE</li>
              <li className="hover:text-blue-400 transition duration-300 cursor-pointer">Bags</li>
              <li className="hover:text-blue-400 transition duration-300 cursor-pointer">Customer Reviews</li>
              <li className="hover:text-blue-400 transition duration-300 cursor-pointer">For Bulk Purchase</li>
              <li className="hover:text-blue-400 transition duration-300">
                <Link to="/contact-us">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Information Section */}
          <div>
            <h2 className="font-bold text-xl mb-6 text-blue-400">INFORMATION</h2>
            <ul className="space-y-4">
              <li className="hover:text-blue-400 transition duration-300 cursor-pointer">Customer Reviews</li>
              <li className="hover:text-blue-400 transition duration-300">
                <Link to="/contact-us">Contact Us</Link>
              </li>
              <li className="hover:text-blue-400 transition duration-300">
                <Link to="/return-policy"> Return & Refund Policy</Link>
              </li>
              <li className="hover:text-blue-400 transition duration-300">
                <Link to="/about-us">About Us</Link>
              </li>
              <li className="hover:text-blue-400 transition duration-300">
                <Link to="/shipping-policy"> Shipping Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          {/* Left Text */}
          <p className="text-sm text-gray-400 text-center md:text-left">
            © 2024, Bag-Society® Powered by Bag-Society · Refund Policy · Privacy Policy · Terms of Service
            · Contact Information
          </p>

          {/* Social and Payment */}
          <div className="flex flex-col md:flex-row items-center mt-6 md:mt-0 space-y-4 md:space-y-0 md:space-x-6">
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com"
                className="text-gray-400 hover:text-blue-500 transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
              <a
                href="https://www.instagram.com"
                className="text-gray-400 hover:text-pink-500 transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
            </div>
            {/* Payment Icons */}
            <div className="flex space-x-4">
              <FaCcAmex
                className="h-6 w-6 text-gray-400 hover:text-blue-500 transition duration-300"
                title="Amex"
              />
              <FaCcDiscover
                className="h-6 w-6 text-gray-400 hover:text-orange-500 transition duration-300"
                title="Discover"
              />
              <FaCcMastercard
                className="h-6 w-6 text-gray-400 hover:text-red-500 transition duration-300"
                title="Mastercard"
              />
              <FaCcVisa
                className="h-6 w-6 text-gray-400 hover:text-blue-700 transition duration-300"
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
