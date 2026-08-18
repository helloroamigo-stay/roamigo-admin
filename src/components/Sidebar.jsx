import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  LayoutDashboard,
  Map,
  UserCheck,
  Users,
  Home,
  CreditCard,
  HelpCircle,
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
    { name: 'Guest Enquiries', path: '/enquiries', icon: HelpCircle },
    { name: 'Payments & Gateways', path: '/payments', icon: CreditCard },
    { name: 'Registered Users', path: '/users', icon: Users },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}

      <aside
        className={`w-68 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 font-sans shadow-xs transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-50 border border-brand-200 shadow-xs">
              <img
                src={"/logo-xs.png"}
                alt="Logo"
                className="w-8 h-8 object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-slate-900 tracking-tight">Roamigo</h1>
              <span className="text-[10px] text-brand-600 font-bold tracking-wider uppercase">Admin Portal</span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
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
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 border border-brand-200/80 shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
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
        <div className="p-4 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3 mb-3.5 px-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all duration-200"
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
