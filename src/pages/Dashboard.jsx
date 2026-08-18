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

      // Load all data sets in parallel
      const [
        usersRes, 
        providersRes, 
        propertiesRes, 
        bookingsRes, 
        paymentsRes
      ] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getProviders(),
        adminAPI.getProperties(),
        adminAPI.getBookings(),
        adminAPI.getPayments(),
      ]);

      const users = usersRes.data?.users || [];
      const providers = providersRes.data?.providers || [];
      const properties = propertiesRes.data?.properties || [];
      const bookings = bookingsRes.data?.bookings || [];
      const payments = paymentsRes.data?.payments || [];

      // Calculate totals
      const totalRev = payments
        .filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS')
        .reduce((sum, p) => sum + (p.amount / 100 || 0), 0); // Assuming amount is in paise/cents from gateway

      const pendingProvs = providers.filter(p => 
        ['REGISTERED', 'PENDING_VERIFICATION', 'PENDING', 'PENDING_APPROVAL'].includes(p.approvalStatus)
      ).length;
      const pendingProps = properties.filter(p => p.status === 'PENDING_APPROVAL').length;

      setStats({
        usersCount: users.length,
        providersCount: providers.length,
        propertiesCount: properties.length,
        bookingsCount: bookings.length,
        totalRevenue: totalRev,
        pendingProviders: pendingProvs,
        pendingProperties: pendingProps,
        recentBookings: bookings.slice(0, 5),
        recentProperties: properties.filter(p => p.status === 'PENDING_APPROVAL').slice(0, 4),
        recentProviders: providers.filter(p => 
          ['REGISTERED', 'PENDING_VERIFICATION', 'PENDING', 'PENDING_APPROVAL'].includes(p.approvalStatus)
        ).slice(0, 4)
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
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Aggregating platform metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-6 flex flex-col items-center max-w-lg mx-auto text-center mt-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Error Loading Overview</h3>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="py-2.5 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium text-sm transition-all"
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
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-900/30 hover:border-emerald-500/50',
      link: '/payments'
    },
    {
      title: 'Guest Enquiries',
      value: stats.bookingsCount,
      subtitle: 'Total guest requests received',
      icon: HelpCircle,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-900/30 hover:border-blue-500/50',
      link: '/enquiries'
    },
    {
      title: 'Active Properties',
      value: stats.propertiesCount,
      subtitle: 'Villas & retreats listed',
      icon: Home,
      color: 'from-amber-500/10 to-brand-500/10 text-brand-400 border-brand-900/30 hover:border-brand-500/50',
      link: '/properties'
    },
    {
      title: 'Registered Users',
      value: stats.usersCount,
      subtitle: 'Guests & service providers',
      icon: Users,
      color: 'from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-900/30 hover:border-purple-500/50',
      link: '/users'
    }
  ];

  return (
    <div className="p-8 space-y-8 font-sans max-w-[1600px] mx-auto">
      {/* Top Banner Alert if Pending Approvals */}
      {(stats.pendingProviders > 0 || stats.pendingProperties > 0) && (
        <div className="bg-[#111827] border-l-4 border-brand-500 rounded-r-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <div className="text-sm">
              <span className="font-semibold text-white">Action Required:</span>
              <span className="text-gray-400 ml-1">
                You have {stats.pendingProviders} host verification requests and {stats.pendingProperties} property listings awaiting review.
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {stats.pendingProviders > 0 && (
              <Link 
                to="/providers" 
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 py-1.5 px-3 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-lg transition-all"
              >
                Review Hosts
              </Link>
            )}
            {stats.pendingProperties > 0 && (
              <Link 
                to="/properties" 
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 py-1.5 px-3 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-lg transition-all"
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
              className={`bg-gradient-to-br ${card.color} border rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 shadow-md hover:shadow-xl group cursor-pointer relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider">{card.title}</span>
                <div className="p-2.5 bg-gray-950/40 group-hover:bg-gray-950/70 rounded-xl transition-all flex items-center gap-1">
                  <Icon className="w-5 h-5" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-display font-bold text-white mb-1">{card.value}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{card.subtitle}</p>
                  <span className="text-[10px] font-semibold text-gray-400 group-hover:text-white underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity">View All &rarr;</span>
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
          <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Pending Property Approvals</h3>
                <p className="text-xs text-gray-500 mt-0.5">Villas awaiting listing review</p>
              </div>
              <Link to="/properties" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentProperties.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm border border-dashed border-gray-800 rounded-2xl">
                No properties pending approval. All active.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentProperties.map((prop) => (
                  <div 
                    key={prop._id} 
                    className="flex items-center justify-between p-4 bg-[#1e293b]/30 hover:bg-[#1e293b]/50 border border-gray-800/80 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      {prop.images?.[0] ? (
                        <img 
                          src={prop.images[0]} 
                          alt={prop.title} 
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-850 flex items-center justify-center text-gray-500">
                          <Home className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[320px]">{prop.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {prop.cityId?.name || prop.city}, {prop.pricePerNight ? `₹${prop.pricePerNight}/night` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Link 
                      to="/properties" 
                      className="text-xs font-semibold text-brand-400 hover:text-white py-2 px-4 bg-brand-500/10 hover:bg-brand-500 border border-brand-500/20 hover:border-brand-500 rounded-xl transition-all"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Provider verification Panel */}
          <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Pending Host Approvals</h3>
                <p className="text-xs text-gray-500 mt-0.5">Providers awaiting KYC validation</p>
              </div>
              <Link to="/providers" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentProviders.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm border border-dashed border-gray-800 rounded-2xl">
                No hosts awaiting approval. All verified.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.recentProviders.map((prov) => (
                  <div 
                    key={prov._id} 
                    className="p-4 bg-[#1e293b]/30 border border-gray-800/80 rounded-2xl flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-sm">
                        {prov.userId?.name?.slice(0, 2).toUpperCase() || 'AD'}
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-semibold text-white truncate">{prov.userId?.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{prov.businessName || 'Host operator'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-850 pt-3">
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-medium uppercase tracking-wider">
                        Pending Approval
                      </span>
                      <Link to="/providers" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
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
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Enquiries</h3>
              <p className="text-xs text-gray-500 mt-0.5">Live guest requests stream</p>
            </div>
            <Link to="/enquiries" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentBookings.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-center text-gray-500 text-sm border border-dashed border-gray-800 rounded-2xl">
              No enquiries logged in the system.
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              {stats.recentBookings.map((bk) => (
                <div 
                  key={bk._id} 
                  className="p-4 bg-[#1e293b]/20 hover:bg-[#1e293b]/40 border border-gray-850/80 rounded-2xl flex flex-col gap-2.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 font-mono">#{bk._id?.slice(-6).toUpperCase()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                      bk.status === 'CONFIRMED' || bk.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : bk.status === 'PENDING_PAYMENT'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {bk.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white truncate">{bk.propertyId?.title || 'Unknown Property'}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>Customer: {bk.customerId?.name || 'Guest'}</span>
                      <span className="text-white font-semibold">₹{bk.totalAmount?.toLocaleString('en-IN')}</span>
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
