import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Destinations from './pages/Destinations';
import Providers from './pages/Providers';
import Properties from './pages/Properties';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';

const AdminLayout = () => {
  const { user, loading } = useAuth();

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
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] flex font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-68 min-h-screen relative z-10">
        <Header />
        <main className="flex-1 bg-[#070b13]/60 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
