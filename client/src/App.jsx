import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketSales from './pages/TicketSales';
import TicketList from './pages/TicketList';
import ParcelDeposit from './pages/ParcelDeposit';
import ParcelList from './pages/ParcelList';
import StaffManagement from './pages/StaffManagement';
import Maintenance from './pages/Maintenance';
import QRScanner from './pages/QRScanner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'AGENT') return <Navigate to="/tickets" />;
  return <Dashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<HomeRedirect />} />
        <Route path="tickets" element={<TicketSales />} />
        <Route path="tickets/list" element={<TicketList />} />
        <Route path="parcels" element={<ParcelDeposit />} />
        <Route path="parcels/list" element={<ParcelList />} />
        <Route path="qr-scanner" element={<QRScanner />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="admin/staff" element={<StaffManagement />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
