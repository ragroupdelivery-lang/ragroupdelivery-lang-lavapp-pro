import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import { useAuth } from './hooks/useAuth';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Public Pages
import ClientPortal from './pages/ClientPortal';

// Auth Pages
import AdminLogin from './pages/auth/AdminLogin';
import ClientLogin from './pages/auth/ClientLogin';
import ClientSignup from './pages/auth/ClientSignup';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Customers from './pages/admin/Customers';
import CustomerDetail from './pages/admin/CustomerDetail';
import Services from './pages/admin/Services';
import Settings from './pages/admin/Settings';

// Customer Pages
import Profile from './pages/client/Profile';

const AdminLayout: React.FC = () => (
  <div className="flex h-screen bg-brand-gray-100 text-brand-gray-800">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray-100 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  </div>
);

const ProtectedAdminRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Or a spinner
  return user && user.role === 'admin' ? <AdminLayout /> : <Navigate to="/admin/login" />;
};

const ProtectedCustomerRoute: React.FC = () => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user && user.role === 'customer' ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<ClientPortal />} />
        
        {/* Auth Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<ClientLogin />} />
        <Route path="/signup" element={<ClientSignup />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:customerId" element={<CustomerDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Protected Customer Routes */}
        <Route element={<ProtectedCustomerRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

      </Routes>
    </HashRouter>
  );
}

export default App;
