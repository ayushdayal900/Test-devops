
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import ScrollToTop from './components/ScrollToTop';

// Layout Components
import Header from './components/Layout/Header'; // Adjusted path
import AdminHeader from './components/Layout/AdminHeader';
import Footer from './components/Layout/Footer'; // Adjusted path

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Designs = lazy(() => import('./pages/Designs'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));

const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminOrderDetails = lazy(() => import('./pages/AdminOrderDetails'));
const AdminCMS = lazy(() => import('./pages/AdminCMS'));
const AdminCustomers = lazy(() => import('./pages/AdminCustomers'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
const AdminMeetings = lazy(() => import('./pages/admin/AdminMeetings'));
const CustomerOrders = lazy(() => import('./pages/CustomerOrders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// Components
import CookieConsent from './components/CookieConsent';
import ChatWidget from './components/ChatBot/ChatWidget';

// Loading Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon"></div>
  </div>
);

// Layout Wrappers
const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
);

const AdminLayout = ({ children }) => (
  <>
    <AdminHeader />
    <main className="min-h-screen bg-gray-50 pb-12">{children}</main>
    <Footer />
  </>
);

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ScrollToTop />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
                <Route path="/designs" element={<PublicLayout><Designs /></PublicLayout>} />
                <Route path="/product/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
                <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />

                {/* Private Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <PublicLayout><Checkout /></PublicLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <PublicLayout><Wishlist /></PublicLayout>
                    </ProtectedRoute>
                  }
                />

                <Route path="/order/:id" element={<ProtectedRoute><PublicLayout><OrderDetails /></PublicLayout></ProtectedRoute>} />

                {/* Customer Routes */}
                <Route path="/customer">
                  <Route path="dashboard" element={<ProtectedRoute role="customer"><PublicLayout><CustomerDashboard /></PublicLayout></ProtectedRoute>} />
                  <Route path="orders" element={<ProtectedRoute role="customer"><PublicLayout><CustomerOrders /></PublicLayout></ProtectedRoute>} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><Outlet /></AdminLayout></ProtectedRoute>}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetails />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="cms" element={<AdminCMS />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="meetings" element={<AdminMeetings />} />
                </Route>

                {/* Public Footer Pages */}
                <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
              </Routes>
            </Suspense>
            <ChatWidget />
            <CookieConsent />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
};

// Helper moved to top

export default App;

