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
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import ProtectedRoute from './context/ProtectedRoute';
import ShowUsers from './components/AdminDashboard/ShowUsers';
import Forbidden from './components/AdminDashboard/Forbidden';
import EditUsers from './components/AdminDashboard/EditUsers';
import ShowProducts from './components/AdminDashboard/ShowProducts';
import AddNewProduct from './components/AdminDashboard/AddProduct';
import ManageOrders from './components/AdminDashboard/ManageOrders';
import OrderDetailPage from './components/AdminDashboard/OrderDetailPage';
import ReturnsPolicy from './components/footer/return-refund-info';
import ShippingPolicy from './components/footer/shipping-info';
import AboutUs from './components/footer/aboutUs';
import PageNotFound from './components/PageNotFound/PageNotFound';
import GoogleAdSense from "./components/AddSence"; // Import the AdSense component
import { HelmetProvider, Helmet } from 'react-helmet-async';  // Import Helmet

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
    <HelmetProvider>
      <UserProvider>
        <Router>
          <div>
            <Navbar />
            <ScrollToTop />

            <div className="main-content">

              {/* SEO metadata for the entire page */}
              <Helmet>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Bag Society - Women’s Handbags Online Store</title>
                <meta name="description" content="Discover a wide range of stylish and high-quality handbags for women at Bag Society. Shop for the latest trends in women's fashion bags, purses, and more!" />
                <meta name="keywords" content="women's handbags, women's purses, online shopping, fashion bags, stylish handbags, handbags for women" />
                <meta name="author" content="Bag Society" />
                <meta property="og:title" content="Bag Society - Women’s Handbags Online Store" />
                <meta property="og:description" content="Discover a wide range of stylish and high-quality handbags for women at Bag Society. Shop for the latest trends in women's fashion bags, purses, and more!" />
                <meta property="og:image" content="https://example.com/og-image.jpg" />
                <meta property="og:url" content="https://bagsociety.vercel.app" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Bag Society - Women’s Handbags Online Store" />
                <meta name="twitter:description" content="Discover a wide range of stylish and high-quality handbags for women at Bag Society. Shop for the latest trends in women's fashion bags, purses, and more!" />
                <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
              </Helmet>


              {/* AdSense at the top of the main content */}
              {/* <GoogleAdSense /> */}

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
                <Route path="/all-products" element={<AllProductsPage />} />

                {/* Product Detail Page */}
                <Route path="/product/:id" element={<ProductDetail />} />

                {/* Cart Page */}
                <Route path="/my-cart" element={<CartPage />} />

                {/* Contact Us Page */}
                <Route path="/contact-us" element={<ContactUsForm />} />

                {/* Checkout Page */}
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Settings Page */}
                <Route path="/setting" element={<SettingsPage />} />

                <Route path="/return-policy" element={<ReturnsPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />

                <Route path="/about-us" element={<AboutUs />} />

                {/* User Profile Page */}
                <Route path="/viewProfile" element={<UserDetails />} />

                {/* Add Address Page */}
                <Route path="/add-address" element={<AddAddressPage />} />

                {/* Buy Now Page */}
                <Route path="/BuyNow" element={<BuyNowPage />} />

                {/* My Orders Page */}
                <Route path="/MyOrders" element={<MyOrdersPage />} />

                {/* Order Confirmation Page */}
                <Route path="/order-confirmation" element={
                  <OrderConfirmationPage />
                } />

                {/* Admin Dashboard and Related Routes */}
                <Route path="/admin-dashboard/*" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin-dashboard/showUsers" element={
                  <ProtectedRoute requiredRole="admin">
                    <ShowUsers />
                  </ProtectedRoute>
                } />

                <Route path="/admin-dashboard/showProducts" element={
                  <ProtectedRoute requiredRole="admin">
                    <ShowProducts />
                  </ProtectedRoute>
                } />

                <Route
                  path="/admin-dashboard/manageOrders"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard/manageOrders/:userId/:orderId"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/admin-dashboard/editUsers" element={
                  <ProtectedRoute requiredRole="admin">
                    <EditUsers />
                  </ProtectedRoute>
                } />

                <Route path="/admin-dashboard/addNewProducts" element={
                  <ProtectedRoute requiredRole="admin">
                    <AddNewProduct />
                  </ProtectedRoute>
                } />

                {/* Catch-all for Forbidden access */}
                <Route path="/forbidden" element={<Forbidden />} />
                {/* Catch-all for non-matching routes */}
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </div>

            <Footer />

            {/* WhatsApp Icon */}
            <div className="whatsapp-icon">
              <a
                href="https://wa.me/+923108026280"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out"
              >
                <FaWhatsapp className="text-2xl" />
              </a>
            </div>
          </div>
        </Router>
      </UserProvider>
    </HelmetProvider>
  );
}

export default App;
