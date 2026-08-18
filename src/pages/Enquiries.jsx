import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  HelpCircle,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Home,
  Filter,
  DollarSign,
  Users as GuestsIcon
} from 'lucide-react';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getBookings();
      setEnquiries(res.data?.bookings || []);
    } catch (err) {
      console.error('Error fetching property enquiries:', err);
      setError('Could not retrieve guest enquiries.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'PAID':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-full px-3 py-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'PENDING':
      case 'PENDING_APPROVAL':
      case 'PENDING_PAYMENT':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-full px-3 py-1 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Review</span>
          </span>
        );
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-950/30 border border-red-900/40 rounded-full px-3 py-1 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 w-fit">
            <span>{status}</span>
          </span>
        );
    }
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const code = enq.bookingCode || enq._id || '';
    const guestName = enq.customerId?.name || '';
    const guestEmail = enq.customerId?.email || '';
    const propTitle = enq.propertyId?.title || '';

    const matchesSearch =
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && ['PENDING', 'PENDING_APPROVAL', 'PENDING_PAYMENT'].includes(enq.status)) ||
      (statusFilter === 'CONFIRMED' && ['CONFIRMED', 'COMPLETED', 'PAID'].includes(enq.status)) ||
      (statusFilter === 'CANCELLED' && ['CANCELLED', 'REJECTED', 'FAILED'].includes(enq.status));

    return matchesSearch && matchesStatus;
  });

  const totalCount = enquiries.length;
  const pendingCount = enquiries.filter(e => ['PENDING', 'PENDING_APPROVAL', 'PENDING_PAYMENT'].includes(e.status)).length;
  const confirmedCount = enquiries.filter(e => ['CONFIRMED', 'COMPLETED', 'PAID'].includes(e.status)).length;
  const cancelledCount = enquiries.filter(e => ['CANCELLED', 'REJECTED', 'FAILED'].includes(e.status)).length;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <HelpCircle className="w-7 h-7 text-brand-400" />
            <span>Guest Enquiries & Reservations</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track and process guest stay enquiries, villa reservation requests, and booking statuses.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Enquiries</span>
            <h3 className="text-2xl font-bold text-white mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Review</span>
            <h3 className="text-2xl font-bold text-white mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Confirmed</span>
            <h3 className="text-2xl font-bold text-white mt-1">{confirmedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Cancelled</span>
            <h3 className="text-2xl font-bold text-white mt-1">{cancelledCount}</h3>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref code, guest, email, villa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-gray-500 hidden sm:block mr-1" />
          {[
            { id: 'ALL', label: 'All Enquiries' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-[#1e293b]/40 hover:bg-[#1e293b] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f172a]/60 border border-gray-800 rounded-3xl">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
          <p className="text-gray-400 text-sm font-medium">Loading property enquiries stream...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-950/20 border border-red-900/40 rounded-3xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Failed to Load Enquiries</h3>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchEnquiries}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="py-16 text-center bg-[#0f172a]/60 border border-gray-800 rounded-3xl">
          <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No enquiries found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-[#1e293b]/40 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Ref Code & Guest</th>
                  <th className="py-4 px-6">Target Property</th>
                  <th className="py-4 px-6">Stay Dates</th>
                  <th className="py-4 px-6">Guests</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Est. Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-[#1e293b]/30 transition-colors">
                    {/* Ref Code & Guest */}
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-brand-400 text-xs">
                        #{enq.bookingCode || enq._id?.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-white font-semibold text-sm mt-0.5">
                        {enq.customerId?.name || 'Guest'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span>{enq.customerId?.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Target Property */}
                    <td className="py-4 px-6 max-w-[260px]">
                      <div className="flex items-start gap-2.5">
                        <Home className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                        <div className="truncate">
                          <div className="text-white font-medium truncate">{enq.propertyId?.title || 'Villa Property'}</div>
                          <div className="text-xs text-gray-500 truncate">{enq.propertyId?.address || 'Goa, India'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Stay Dates */}
                    <td className="py-4 px-6 text-xs">
                      <div className="flex items-center gap-1.5 text-white">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDate(enq.checkIn)} &ndash; {formatDate(enq.checkOut)}</span>
                      </div>
                    </td>

                    {/* Guests */}
                    <td className="py-4 px-6 text-xs text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <GuestsIcon className="w-3.5 h-3.5 text-gray-500" />
                        <span>{enq.guestsCount || 1} Guests</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">{getStatusBadge(enq.status)}</td>

                    {/* Est. Price */}
                    <td className="py-4 px-6 text-right font-semibold text-white text-base">
                      ₹{enq.totalAmount?.toLocaleString('en-IN') || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
