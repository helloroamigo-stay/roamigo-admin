import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  LayoutDashboard,
  Map,
  UserCheck,
  Home,
  CreditCard,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  // Auto-close mobile sidebar when navigating between pages
  useEffect(() => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname, setMobileOpen]);

  const menuItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Destinations & Collections', path: '/destinations', icon: Map },
    { name: 'Providers', path: '/providers', icon: UserCheck },
    { name: 'Properties', path: '/properties', icon: Home },
    { name: 'Payments & Payouts', path: '/bookings', icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}

      <aside
        className={`w-68 bg-[#0f172a] border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-40 font-sans transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10  flex items-center justify-center shadow-md shadow-brand-500/10">
              <img
                src={"/logo-xs.png"}
                alt="Avatar"
                className="w-9 h-9 object-cover ring-2 ring-brand-500/20"
              />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-white tracking-tight">Roamigo</h1>
              <span className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase">Admin Portal</span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg transition-all cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border border-transparent'
                  }`
                }
              >
                <Icon className="w-5 h-5 stroke-[1.75]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin User Card & Logout */}
        <div className="p-4 border-t border-gray-800 bg-[#0c1222]/80">
          <div className="flex items-center gap-3 mb-4 px-2">
            {user?.avatar ? (
              <img
                src={"/logo-xs.png"}
                alt="Avatar"
                className="w-9 h-9  object-cover ring-2 ring-brand-500/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800/50 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 text-gray-400 border border-gray-850 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
