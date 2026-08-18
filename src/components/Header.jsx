import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Shield, Calendar, Menu } from 'lucide-react';

const Header = ({ onOpenMobile }) => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'System Overview';
      case '/destinations':
        return 'Manage Destinations';
      case '/providers':
        return 'Provider Verification';
      case '/properties':
        return 'Property Approvals';
      case '/enquiries':
        return 'Guest Enquiries';
      case '/payments':
        return 'Payments & Gateways';
      case '/users':
        return 'Registered Users';
      default:
        return 'Admin Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (location.pathname) {
      case '/':
        return 'Key performance metrics and quick system actions.';
      case '/destinations':
        return 'Configure travel destinations, cities, and categories.';
      case '/providers':
        return 'Approve, reject, or manage service providers and KYC requests.';
      case '/properties':
        return 'Review and publish property listings submitted by hosts.';
      case '/enquiries':
        return 'Track guest stay requests, villa enquiries, and status updates.';
      case '/payments':
        return 'Monitor gateway order transactions and payment status.';
      case '/users':
        return 'Manage guest and host user accounts.';
      default:
        return 'Manage Roamigo rental network operations.';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 font-sans shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden text-slate-600 hover:text-slate-900 p-2 bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">{getPageDescription()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>{currentDate}</span>
        </div>

        {/* Security level badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 sm:px-3 py-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Secure Mode</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
