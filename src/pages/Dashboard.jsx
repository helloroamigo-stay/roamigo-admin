import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  Users,
  UserCheck,
  Home,
  Calendar,
  HelpCircle,
  DollarSign,
  Activity,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    usersCount: 0,
    providersCount: 0,
    propertiesCount: 0,
    bookingsCount: 0,
    totalRevenue: 0,
    pendingProviders: 0,
    pendingProperties: 0,
    recentBookings: [],
    recentProperties: [],
    recentProviders: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await adminAPI.getDashboardStats();
      const statsData = res.data || {};

      setStats({
        usersCount: statsData.usersCount || 0,
        providersCount: statsData.providersCount || 0,
        propertiesCount: statsData.propertiesCount || 0,
        bookingsCount: statsData.bookingsCount || 0,
        totalRevenue: statsData.totalRevenue || 0,
        pendingProviders: statsData.pendingProviders || 0,
        pendingProperties: statsData.pendingProperties || 0,
        recentBookings: statsData.recentBookings || [],
        recentProperties: statsData.recentProperties || [],
        recentProviders: statsData.recentProviders || [],
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to aggregate dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Aggregating platform metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex flex-col items-center max-w-lg mx-auto text-center mt-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error Loading Overview</h3>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtitle: 'From confirmed gateway orders',
      icon: DollarSign,
      color: 'from-emerald-50/80 to-teal-50/60 text-emerald-800 border-emerald-200/80 hover:border-emerald-400',
      iconBg: 'bg-emerald-100 text-emerald-700',
      link: '/payments'
    },
    {
      title: 'Guest Enquiries',
      value: stats.bookingsCount,
      subtitle: 'Total guest requests received',
      icon: HelpCircle,
      color: 'from-blue-50/80 to-indigo-50/60 text-blue-800 border-blue-200/80 hover:border-blue-400',
      iconBg: 'bg-blue-100 text-blue-700',
      link: '/enquiries'
    },
    {
      title: 'Active Properties',
      value: stats.propertiesCount,
      subtitle: 'Villas & retreats listed',
      icon: Home,
      color: 'from-sky-50/80 to-brand-50/60 text-brand-900 border-sky-200/80 hover:border-sky-400',
      iconBg: 'bg-brand-100 text-brand-700',
      link: '/properties'
    },
    {
      title: 'Registered Users',
      value: stats.usersCount,
      subtitle: 'Guests & service providers',
      icon: Users,
      color: 'from-purple-50/80 to-pink-50/60 text-purple-900 border-purple-200/80 hover:border-purple-400',
      iconBg: 'bg-purple-100 text-purple-700',
      link: '/users'
    }
  ];

  return (
    <div className="p-8 space-y-8 font-sans max-w-[1600px] mx-auto">
      {/* Top Banner Alert if Pending Approvals */}
      {(stats.pendingProviders > 0 || stats.pendingProperties > 0) && (
        <div className="bg-white border-l-4 border-brand-600 border-y border-r border-slate-200 rounded-r-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <div className="text-sm">
              <span className="font-bold text-slate-900">Action Required:</span>
              <span className="text-slate-600 ml-1">
                You have {stats.pendingProviders} host verification requests and {stats.pendingProperties} property listings awaiting review.
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {stats.pendingProviders > 0 && (
              <Link
                to="/providers"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 py-1.5 px-3 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-all"
              >
                Review Hosts
              </Link>
            )}
            {stats.pendingProperties > 0 && (
              <Link
                to="/properties"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 py-1.5 px-3 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-all"
              >
                Review Listings
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className={`bg-gradient-to-br ${card.color} border rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 shadow-xs hover:shadow-md group cursor-pointer relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-wider">{card.title}</span>
                <div className={`p-2.5 rounded-xl transition-all flex items-center gap-1 ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-display font-bold text-slate-900 mb-1">{card.value}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">{card.subtitle}</p>
                  <span className="text-[11px] font-semibold text-brand-600 group-hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">View All &rarr;</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid Layout for details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Approvals Review Block */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Listings Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pending Property Approvals</h3>
                <p className="text-xs text-slate-500 mt-0.5">Villas awaiting listing review</p>
              </div>
              <Link to="/properties" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentProperties.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
                No properties pending approval. All active.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentProperties.map((prop) => (
                  <div
                    key={prop._id}
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      {prop.images?.[0] ? (
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                          <Home className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[320px]">{prop.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {prop.cityId?.name || prop.city}, {prop.pricePerNight ? `₹${prop.pricePerNight}/night` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/properties"
                      className="text-xs font-semibold text-brand-700 hover:text-white py-2 px-4 bg-brand-50 hover:bg-brand-600 border border-brand-200 hover:border-brand-600 rounded-xl transition-all"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Provider verification Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pending Host Approvals</h3>
                <p className="text-xs text-slate-500 mt-0.5">Providers awaiting KYC validation</p>
              </div>
              <Link to="/providers" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentProviders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
                No hosts awaiting approval. All verified.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.recentProviders.map((prov) => (
                  <div
                    key={prov._id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                        {prov.userId?.name?.slice(0, 2).toUpperCase() || 'AD'}
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{prov.userId?.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{prov.businessName || 'Host operator'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-[10px] px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-bold uppercase tracking-wider">
                        Pending Review
                      </span>
                      <Link to="/providers" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                        Verify Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Recent Enquiries list */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col h-full shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Enquiries</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live guest requests stream</p>
            </div>
            <Link to="/enquiries" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentBookings.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
              No enquiries logged in the system.
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {stats.recentBookings.map((bk) => (
                <div
                  key={bk._id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex flex-col gap-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 font-mono">#{bk.bookingCode || bk._id?.slice(-6).toUpperCase()}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${bk.status === 'CONFIRMED' || bk.status === 'COMPLETED' || bk.status === 'PAID'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : bk.status === 'PENDING' || bk.status === 'PENDING_PAYMENT'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                      {bk.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{bk.propertyId?.title || 'Unknown Property'}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>Customer: {bk.customerId?.name || 'Guest'}</span>
                      <span className="text-slate-900 font-bold">₹{bk.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
