import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Destinations from './pages/Destinations';
import Providers from './pages/Providers';
import Properties from './pages/Properties';
import PropertyReview from './pages/PropertyReview';
import Enquiries from './pages/Enquiries';
import Payments from './pages/Payments';
import Users from './pages/Users';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';
import { ConfigProvider, theme as antdTheme } from 'antd';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium">Securing session gateway...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] flex font-sans overflow-x-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col lg:pl-68 pl-0 min-h-screen relative z-10 w-full overflow-x-hidden">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 bg-[#070b13]/60 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/review/:id" element={<PropertyReview />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/bookings" element={<Navigate to="/enquiries" replace />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 12,
          colorBgContainer: '#111827',
          fontFamily: 'inherit',
        },
      }}
    >
      <Router>
        <AuthProvider>
          <AdminLayout />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
