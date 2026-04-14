import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"    element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        {/* Citizen Protected */}
        <Route path="/dashboard"    element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/submit"       element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
        <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Admin Protected */}
        <Route path="/admin"            element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/complaints" element={<AdminRoute><AdminComplaints /></AdminRoute>} />
        <Route path="/admin/complaint/:id" element={<AdminRoute><ComplaintDetail /></AdminRoute>} />
        <Route path="/admin/analytics"  element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
        <Route path="/admin/users"      element={<AdminRoute><AdminUsers /></AdminRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
