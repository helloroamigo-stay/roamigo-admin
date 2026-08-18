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
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </span>
        );
      case 'PENDING':
      case 'INITIATED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'FAILED':
      case 'REFUNDED':
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 w-fit">
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
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-emerald-600" />
            <span>Payments & Gateway Orders</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time transaction stream, Razorpay gateway payment orders, and financial history.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Revenue</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              ₹{totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Successful</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{successCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending / Initiated</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, guest, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1" />
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'SUCCESS', label: 'Success' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'FAILED', label: 'Failed/Refunded' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium">Fetching payment gateway logs...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Payments</h3>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchPayments}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No payment transactions found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Gateway Ref & Order ID</th>
                  <th className="py-4 px-6">Booking Ref</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Gateway Ref & Order ID */}
                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="text-slate-900 font-bold">{p.paymentId || 'Pending Gateway ID'}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">order: {p.orderId || 'N/A'}</div>
                    </td>

                    {/* Booking Ref */}
                    <td className="py-4 px-6 font-mono text-xs text-brand-600 font-bold">
                      #{p.bookingId?.bookingCode || p.bookingId?._id?.slice(-6).toUpperCase() || 'N/A'}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-bold text-sm">{p.customerId?.name || 'Guest Customer'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{p.customerId?.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Method & Date */}
                    <td className="py-4 px-6 text-xs">
                      <div className="text-slate-900 uppercase font-bold">{p.paymentMethod || 'UPI / Card / NetBanking'}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{formatDate(p.createdAt)}</div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">{getStatusBadge(p.status)}</td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-right font-bold text-slate-900 text-base">
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
