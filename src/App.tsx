import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import LandingPage from './pages/LandingPage';
import FarmerLogin from './pages/FarmerLogin';
import FarmerRegister from './pages/FarmerRegister';
import FarmerForgotPassword from './pages/FarmerForgotPassword';
import OfficialLogin from './pages/OfficialLogin';
import OfficialForgotPassword from './pages/OfficialForgotPassword';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerProfile from './pages/FarmerProfile';
import VerifierDashboard from './pages/VerifierDashboard';
import FieldOfficerDashboard from './pages/FieldOfficerDashboard';
import RevenueOfficerDashboard from './pages/RevenueOfficerDashboard';
import TreasuryOfficerDashboard from './pages/TreasuryOfficerDashboard';
import { Toaster } from './components/ui/sonner';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/preview_page.html" element={<Navigate to="/" replace />} />
        <Route path="/farmer-login" element={<FarmerLogin />} />
        <Route path="/farmer-register" element={<FarmerRegister />} />
        <Route path="/farmer-forgot-password" element={<FarmerForgotPassword />} />
        <Route path="/official-login" element={<OfficialLogin />} />
        <Route path="/official-forgot-password" element={<OfficialForgotPassword />} />
        <Route path="/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer-profile" element={<FarmerProfile />} />
        <Route path="/verifier" element={<VerifierDashboard />} />
        <Route path="/field-officer" element={<FieldOfficerDashboard />} />
        <Route path="/revenue-officer" element={<RevenueOfficerDashboard />} />
        <Route path="/treasury-officer" element={<TreasuryOfficerDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router basename="/">
      <Toaster />
      <AnimatedRoutes />
    </Router>
  );
}
