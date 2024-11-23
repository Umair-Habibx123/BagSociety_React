import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Query Section */}
          <div>
            <h2 className="font-bold text-lg mb-4">Put your query at</h2>
            <p>Whatsapp: +92-347-5391207</p>
            <p>Email: cs@astore.pk</p>
            <p>Business hours: 24/7</p>
          </div>
          {/* Shop Section */}
          <div>
            <h2 className="font-bold text-lg mb-4">SHOP</h2>
            <ul className="space-y-2">
              <li>10.10 SALE</li>
              <li>Bags</li>
              <li>Clothing Line</li>
              <li>Accessories</li>
              <li>Footwear</li>
              <li>Customer Reviews</li>
              <li>For Bulk Purchase</li>
              <li>Contact us</li>
            </ul>
          </div>
          {/* Information Section */}
          <div>
            <h2 className="font-bold text-lg mb-4">INFORMATION</h2>
            <ul className="space-y-2">
              <li>Customer Reviews</li>
              <li>Contact us</li>
              <li>Return & Refund Policy</li>
              <li>About us</li>
              <li>Shipping Policy</li>
              <li>Blogs</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center">
          {/* Left */}
          <p className="text-sm">
            © 2024, Astore® Powered by Shopify · Refund policy · Privacy policy
            · Terms of service · Contact information
          </p>

          {/* Social and Payment */}
          <div className="flex items-center mt-4 md:mt-0 space-x-4">
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a href="https://www.facebook.com" className="hover:opacity-75">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com" className="hover:opacity-75">
                <i className="fab fa-instagram"></i>
              </a>

            </div>
            {/* Payment Icons */}
            <div className="flex space-x-4">
              <img
                src="/path/to/amex.png"
                alt="Amex"
                className="h-6"
              />
              <img
                src="/path/to/discover.png"
                alt="Discover"
                className="h-6"
              />
              <img
                src="/path/to/mastercard.png"
                alt="Mastercard"
                className="h-6"
              />
              <img
                src="/path/to/visa.png"
                alt="Visa"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
