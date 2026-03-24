import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Pages
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { BookingFlow } from './pages/BookingFlow';
import { UserDashboard } from './pages/UserDashboard';
import { AdminPanel } from './pages/AdminPanel';
import VerifyOTP from './pages/VerifyOTP';
import { PenaltyPayment } from './pages/PenaltyPayment';
import { ParkingPass } from './pages/ParkingPass';
import { SelectReservedSlot } from './pages/SelectReservedSlot';
import { TermsConditions } from './pages/TermsConditions';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-[#EAB308]/30 border-t-[#EAB308] rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <div className="min-h-screen bg-white">
            <Toaster position="top-center" expand={true} richColors closeButton />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth type="login" />} />
              <Route path="/register" element={<Auth type="register" />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/terms" element={<TermsConditions />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/booking" element={
                <ProtectedRoute>
                  <BookingFlow />
                </ProtectedRoute>
              } />

              <Route path="/passes" element={
                <ProtectedRoute>
                  <ParkingPass />
                </ProtectedRoute>
              } />

              <Route path="/passes/select" element={
                <ProtectedRoute>
                  <SelectReservedSlot />
                </ProtectedRoute>
              } />

              <Route path="/history" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />

              <Route path="/penalty/:id" element={
                <ProtectedRoute>
                  <PenaltyPayment />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
