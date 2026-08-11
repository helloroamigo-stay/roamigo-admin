import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  LayoutDashboard, 
  Map, 
  UserCheck, 
  Home, 
  CreditCard, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Destinations', path: '/destinations', icon: Map },
    { name: 'Providers', path: '/providers', icon: UserCheck },
    { name: 'Properties', path: '/properties', icon: Home },
    { name: 'Payments & Payouts', path: '/bookings', icon: CreditCard },
  ];

  return (
    <aside className="w-68 bg-[#0f172a] border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-20 font-sans">
      {/* Brand Logo */}
      <div className="h-20 border-b border-gray-800 flex items-center px-6 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/10">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-white tracking-tight">Roamigo</h1>
          <span className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase">Admin Portal</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive 
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
              src={user.avatar} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20" 
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
  );
};

export default Sidebar;
