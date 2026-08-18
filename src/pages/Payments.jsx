import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  CreditCard,
  Search,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Mail,
  User,
  Filter,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getPayments();
      console.log(res);

      setPayments(res.data?.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Could not retrieve payment transaction records.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
      case 'PAID':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-full px-3 py-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </span>
        );
      case 'PENDING':
      case 'INITIATED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-full px-3 py-1 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending</span>
          </span>
        );
      case 'FAILED':
      case 'REFUNDED':
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-950/30 border border-red-900/40 rounded-full px-3 py-1 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
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

  const filteredPayments = payments.filter((p) => {
    const paymentId = p.paymentId || '';
    const orderId = p.orderId || '';
    const bookingCode = p.bookingId?.bookingCode || p.bookingId?._id || '';
    const customerName = p.customerId?.name || '';
    const customerEmail = p.customerId?.email || '';

    const matchesSearch =
      paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUCCESS' && ['SUCCESS', 'COMPLETED', 'PAID'].includes(p.status)) ||
      (statusFilter === 'PENDING' && ['PENDING', 'INITIATED'].includes(p.status)) ||
      (statusFilter === 'FAILED' && ['FAILED', 'REFUNDED', 'CANCELLED'].includes(p.status));

    return matchesSearch && matchesStatus;
  });

  const totalVolume = payments
    .filter(p => ['SUCCESS', 'COMPLETED', 'PAID'].includes(p.status))
    .reduce((sum, p) => sum + (p.amount / 100 || 0), 0);

  const totalCount = payments.length;
  const successCount = payments.filter(p => ['SUCCESS', 'COMPLETED', 'PAID'].includes(p.status)).length;
  const pendingCount = payments.filter(p => ['PENDING', 'INITIATED'].includes(p.status)).length;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-emerald-400" />
            <span>Payments & Gateway Orders</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time transaction stream, Razorpay gateway payment orders, and financial history.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Revenue</span>
            <h3 className="text-2xl font-bold text-white mt-1">
              ₹{totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <h3 className="text-2xl font-bold text-white mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Successful</span>
            <h3 className="text-2xl font-bold text-white mt-1">{successCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending / Initiated</span>
            <h3 className="text-2xl font-bold text-white mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, guest, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-gray-500 hidden sm:block mr-1" />
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'SUCCESS', label: 'Success' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'FAILED', label: 'Failed/Refunded' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-[#1e293b]/40 hover:bg-[#1e293b] text-gray-400 hover:text-white border border-gray-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f172a]/60 border border-gray-800 rounded-3xl">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <p className="text-gray-400 text-sm font-medium">Fetching payment gateway logs...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-950/20 border border-red-900/40 rounded-3xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Failed to Load Payments</h3>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchPayments}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="py-16 text-center bg-[#0f172a]/60 border border-gray-800 rounded-3xl">
          <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No payment transactions found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-[#1e293b]/40 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Gateway Ref & Order ID</th>
                  <th className="py-4 px-6">Booking Ref</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#1e293b]/30 transition-colors">
                    {/* Gateway Ref & Order ID */}
                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="text-white font-semibold">{p.paymentId || 'Pending Gateway ID'}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">order: {p.orderId || 'N/A'}</div>
                    </td>

                    {/* Booking Ref */}
                    <td className="py-4 px-6 font-mono text-xs text-brand-400 font-semibold">
                      #{p.bookingId?.bookingCode || p.bookingId?._id?.slice(-6).toUpperCase() || 'N/A'}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="text-white font-medium text-sm">{p.customerId?.name || 'Guest Customer'}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span>{p.customerId?.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Method & Date */}
                    <td className="py-4 px-6 text-xs">
                      <div className="text-white uppercase font-semibold">{p.paymentMethod || 'UPI / Card / NetBanking'}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">{formatDate(p.createdAt)}</div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">{getStatusBadge(p.status)}</td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-right font-semibold text-white text-base">
                      ₹{(p.amount / 100 || 0).toLocaleString('en-IN')}
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

export default Payments;
