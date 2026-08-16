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
      case '/bookings':
        return 'Payments & Payouts';
      default:
        return 'Admin Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (location.pathname) {
      case '/':
        return 'Key performance metrics and quick actions.';
      case '/destinations':
        return 'Configure travel destinations, cities, categories, and icons.';
      case '/providers':
        return 'Approve, reject, or manage service providers and KYC requests.';
      case '/properties':
        return 'Review and publish property listings submitted by hosts.';
      case '/bookings':
        return 'Track transaction records, refunds, and process provider payouts.';
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
    <header className="h-20 bg-[#070b13]/40 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 font-sans">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden text-gray-400 hover:text-white p-2 bg-gray-900 border border-gray-800 rounded-xl transition-all cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">{getPageDescription()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-1.5">
          <Calendar className="w-4 h-4 text-brand-400" />
          <span>{currentDate}</span>
        </div>

        {/* Security level badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-xl px-2.5 sm:px-3 py-1.5">
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Secure Mode</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
