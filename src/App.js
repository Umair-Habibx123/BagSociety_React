import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import PaymentPage from './components/Settings/payment';
import OrderList from './components/Settings/myorders';
import UserDetails from './components/Settings/UserDetails';
import AddAddressPage from './components/Settings/AddAddressPage';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe("pk_test_51QOCsjG75TGzEhkJZOpAO9uh6tnI7wWD64rJoxEqx9y6DZGmiTOPBWvmVuMs5ABGUVdU5GvOsDvGT51aAG196r1S008d0El8NR");


function App() {
  return (
    <UserProvider>
      <Router>
        <div>
          <Navbar />

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
                <Elements stripe={stripePromise}>
                  <CheckoutPage /> {/* cart page */}
                </Elements>
              </>
            } />

            <Route path="/setting" element={
              <>
                <SettingsPage /> {/* cart page */}
              </>
            } />

            <Route path="/MyPayments" element={
              <>
                <Elements stripe={stripePromise}>
                  <PaymentPage /> {/* cart page */}
                </Elements>
              </>
            } />

            <Route path="/MyOrders" element={
              <>
                <OrderList /> {/* cart page */}
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
