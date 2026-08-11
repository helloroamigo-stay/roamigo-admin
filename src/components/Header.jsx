import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Shield, Calendar } from 'lucide-react';

const Header = () => {
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
    <header className="h-20 bg-[#070b13]/40 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10 font-sans">
      <div>
        <h2 className="text-xl font-display font-bold text-white tracking-tight">
          {getPageTitle()}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">{getPageDescription()}</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-1.5">
          <Calendar className="w-4 h-4 text-brand-400" />
          <span>{currentDate}</span>
        </div>

        {/* Security level badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-xl px-3 py-1.5">
          <Shield className="w-4 h-4" />
          <span>Secure Mode</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
