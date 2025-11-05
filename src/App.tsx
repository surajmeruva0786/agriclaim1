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
import { AuthProvider, useAuth } from './contexts/AuthContext';

function Protected({ children, allow }: { children: React.ReactElement; allow: Array<string> }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to={location.pathname.startsWith('/verifier') || location.pathname.startsWith('/field') || location.pathname.startsWith('/revenue') || location.pathname.startsWith('/treasury') ? '/official-login' : '/farmer-login'} replace />;
  if (role && allow.includes(role)) return children;
  return <Navigate to={role === 'Farmer' ? '/dashboard' : role === 'Verifier' ? '/verifier' : role === 'FieldOfficer' ? '/field-officer' : role === 'RevenueOfficer' ? '/revenue-officer' : role === 'TreasuryOfficer' ? '/treasury-officer' : '/'} replace />;
}

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
        <Route path="/dashboard" element={<Protected allow={["Farmer"]}><FarmerDashboard /></Protected>} />
        <Route path="/farmer-profile" element={<Protected allow={["Farmer"]}><FarmerProfile /></Protected>} />
        <Route path="/verifier" element={<Protected allow={["Verifier"]}><VerifierDashboard /></Protected>} />
        <Route path="/field-officer" element={<Protected allow={["FieldOfficer"]}><FieldOfficerDashboard /></Protected>} />
        <Route path="/revenue-officer" element={<Protected allow={["RevenueOfficer"]}><RevenueOfficerDashboard /></Protected>} />
        <Route path="/treasury-officer" element={<Protected allow={["TreasuryOfficer"]}><TreasuryOfficerDashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <Toaster />
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}
