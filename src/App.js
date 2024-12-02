import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import { UserProvider } from './context/UserContext';
import ProductsSection from "./components/ProductCard/ProductsSection";
import AllProductsPage from "./components/AllProductsPage/AllProductsPage";
import Footer from "./components/footer/footer";
import { FaWhatsapp } from 'react-icons/fa'; // Import WhatsApp icon from react-icons
import './App.css';
import CartPage from './components/CartPage/cartpage';
import ContactUsForm from './components/ContactPage/contactus';
import CheckoutPage from './components/checkoutPage/checkout_page';
import SettingsPage from './components/Settings/setting';
import UserDetails from './components/Settings/UserDetails';
import AddAddressPage from './components/Settings/AddAddressPage';
import BuyNowPage from './components/BuyNow/BuyNowPage';
import ProductDetail from "./components/ProductCard/productDetails";
import MyOrdersPage from './components/MyOrders/myorders';
import OrderConfirmationPage from './components/OrderConfirmation/OrderConfirmationPage';


// Component to scroll to the top
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);  // Scroll to the top of the page whenever route changes
  }, [location]);  // Depend on `location` to trigger the effect on route change

  return null; // This component doesn't render anything
}

function App() {

  return (
    <UserProvider>
      <Router>
        <div>
          <Navbar />
          {/* ScrollToTop component ensures page scrolls to the top on route change */}
          <ScrollToTop />

          {/* Routes for different pages */}
          <Routes>
            {/* Home Page */}
            <Route path="/" element={
              <>
                <Hero />
                <ProductsSection />
              </>
            } />

            {/* All Products Page */}
            <Route path="/all-products" element={
              <>
                <AllProductsPage /> {/* This will display paginated grid of all products */}
              </>
            } />

            {/* Product Detail Page */}
            <Route path="/product/:id" element={
              <>
                <ProductDetail /> {/* Displays detailed view of the selected product */}
              </>
            } />

            <Route path="/my-cart" element={
              <>
                <CartPage /> {/* cart page */}
              </>
            } />

            <Route path="/contact-us" element={
              <>
                <ContactUsForm /> {/* cart page */}
              </>
            } />

            <Route path="/checkout" element={
              <>
                <CheckoutPage /> {/* cart page */}
              </>
            } />

            <Route path="/setting" element={
              <>
                <SettingsPage /> {/* cart page */}
              </>
            } />

            <Route path="/viewProfile" element={
              <>
                <UserDetails /> {/* cart page */}
              </>
            } />

            <Route path="/add-address" element={
              <>
                <AddAddressPage /> {/* cart page */}
              </>
            } />

            <Route path="/MyOrders" element={
              <>
                <MyOrdersPage /> {/* cart page */}
              </>
            } />

            <Route path="/BuyNow" element={
              <>
                <BuyNowPage /> {/* cart page */}
              </>
            } />

            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          </Routes>

          <Footer />

          <div className="whatsapp-icon">
            <a
              href="https://wa.me/yourPhoneNumber" // Replace with your WhatsApp number link
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="whatsapp-icon-img" />
            </a>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
