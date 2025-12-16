import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import Stadiums from "./pages/Stadiums/Stadiums";
import StadiumDetails from "./pages/Stadiums/StadiumDetails";
import Profile from './pages/Profile/Profile';
import About from './pages/About';
import ScrollToTop from './components/ScrollToTop';
import Reservations from './pages/Reservations/Reservations';
import PaymentPage from './pages/Payment/PaymentPage';
import Contact  from './pages/Contact';

// Import admin components
import ProtectedAdminRoute from './components/ProtectedAdminRoute'; // Route protection for admin pages
import AdminLayout from './components/AdminLayout'; // Layout wrapper for all admin pages
import AdminDashboard from './pages/Admin/AdminDashboard'; // Dashboard page
import AdminStadiums from './pages/Admin/AdminStadiums'; // Stadiums management page
//import AdminSessions from './pages/Admin/AdminSessions'; // Sessions management page
import AdminReservations from './pages/Admin/AdminReservations'; // Reservations management page
import AdminProfile from './pages/Admin/AdminProfile'; // Admin profile page
import ProtectedUserRoute from './components/ProtectedUserRoute';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/stadiums" element={<Stadiums />} />
        <Route path="/stadiums/:id" element={<StadiumDetails />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/payment/:reservationId" element={<PaymentPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin Routes - Protected by ProtectedAdminRoute */}
        {/* All admin routes are wrapped with ProtectedAdminRoute to check admin role */}
        {/* AdminLayout wraps all admin pages with sidebar navigation */}
        <Route
          path="/admin/dashboard"
          element={
            // ProtectedAdminRoute checks if user is admin before showing page
            <ProtectedAdminRoute>
              {/* AdminLayout provides sidebar and navigation */}
              <AdminLayout>
                {/* AdminDashboard is the actual page content */}
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/stadiums"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminStadiums />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        {/* <Route
          path="/admin/sessions"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminSessions />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        /> */}

        <Route
          path="/admin/reservations"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminReservations />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminProfile />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
