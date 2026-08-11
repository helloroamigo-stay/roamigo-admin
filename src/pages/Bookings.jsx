import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Calendar, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Building,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsRes, paymentsRes, payoutsRes] = await Promise.all([
        adminAPI.getBookings(),
        adminAPI.getPayments(),
        adminAPI.getPayouts()
      ]);
      setBookings(bookingsRes.data?.bookings || []);
      setPayments(paymentsRes.data?.payments || []);
      setPayouts(payoutsRes.data?.payouts || []);
    } catch (err) {
      console.error('Error fetching financial ledgers:', err);
      setError('Could not retrieve billing transactions data.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (id) => {
    if (!window.confirm('Process payout transfer to host? This will mark the ledger item as PAID and generate a gateway transfer ID.')) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.processPayout(id);
      fetchFinancialData();
    } catch (err) {
      alert(err.message || 'Processing payout failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'COMPLETED':
      case 'SUCCESS':
      case 'PAID':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      default:
        return 'bg-gray-800 border-gray-700 text-gray-400';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && bookings.length === 0 && payments.length === 0 && payouts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading financial ledgers...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Sub-navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex bg-gray-900/80 p-1 border border-gray-850 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Gateways & Refunds</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Host Payouts Ledger</span>
            {payouts.filter(p => p.payoutStatus === 'PENDING').length > 0 && (
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-300 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* RENDER BOOKINGS LEDGER */}
      {activeTab === 'bookings' && (
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-base font-bold text-white">All Bookings</h3>
            <p className="text-xs text-gray-500 mt-0.5">Stream of guest vacation reservations</p>
          </div>
          {bookings.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No reservations logged in the database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-900/40">
                    <th className="p-4 pl-6">ID & Guest</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Stay Dates</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850 text-sm">
                  {bookings.map((bk) => (
                    <tr key={bk._id} className="hover:bg-gray-900/10 transition-all">
                      <td className="p-4 pl-6">
                        <div className="font-mono font-bold text-brand-400 text-xs">#{bk._id?.slice(-6).toUpperCase()}</div>
                        <div className="text-white font-medium mt-0.5">{bk.customerId?.name || 'Guest'}</div>
                        <div className="text-[10px] text-gray-500">{bk.customerId?.email}</div>
                      </td>
                      <td className="p-4 max-w-[240px] truncate">
                        <div className="text-white font-medium truncate">{bk.propertyId?.title || 'Unknown Property'}</div>
                        <div className="text-[11px] text-gray-500 truncate">{bk.propertyId?.address || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-xs space-y-0.5">
                        <div className="text-white"><span className="text-gray-500">In:</span> {formatDate(bk.checkIn)}</div>
                        <div className="text-white"><span className="text-gray-500">Out:</span> {formatDate(bk.checkOut)}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2.5 py-1 border rounded-full font-bold uppercase tracking-wider ${getStatusBadge(bk.status)}`}>
                          {bk.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right text-white font-semibold text-base">
                        ₹{bk.totalAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RENDER PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-base font-bold text-white">Payment Transactions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Gateway orders and refunds</p>
          </div>
          {payments.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No transaction records registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-900/40">
                    <th className="p-4 pl-6">Booking Ref</th>
                    <th className="p-4">Gateway Reference</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Method & Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Paid Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850 text-sm">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-900/10 transition-all">
                      <td className="p-4 pl-6 font-mono text-brand-400 text-xs font-semibold">
                        #{p.bookingId?._id?.slice(-6).toUpperCase() || 'N/A'}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <div className="text-white">{p.paymentId || 'N/A'}</div>
                        <div className="text-gray-500 text-[10px] mt-0.5">order: {p.orderId || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{p.customerId?.name || 'Guest'}</div>
                        <div className="text-[10px] text-gray-500">{p.customerId?.email}</div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="text-white uppercase font-semibold">{p.paymentMethod || 'UPI/Card'}</div>
                        <div className="text-gray-500 text-[10px] mt-0.5">{formatDate(p.createdAt)}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2.5 py-1 border rounded-full font-bold uppercase tracking-wider ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right text-white font-semibold text-base">
                        ₹{(p.amount / 100).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RENDER HOST PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-base font-bold text-white">Host Payouts</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage provider payout balances and banking transfers</p>
          </div>
          {payouts.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No payout ledger files present.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-900/40">
                    <th className="p-4 pl-6">Host Operator</th>
                    <th className="p-4">Booking Ref</th>
                    <th className="p-4">Bank Accounts Payout Details</th>
                    <th className="p-4">Splits</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850 text-sm">
                  {payouts.map((l) => (
                    <tr key={l._id} className="hover:bg-gray-900/10 transition-all">
                      <td className="p-4 pl-6">
                        <div className="text-white font-semibold">{l.providerId?.userId?.name || 'Partner Host'}</div>
                        <div className="text-xs text-brand-400 font-medium mt-0.5">{l.providerId?.businessName || 'Operator'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-gray-400 text-xs font-semibold">#{l.bookingId?._id?.slice(-6).toUpperCase() || 'N/A'}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Total booking: ₹{l.amountBooked?.toLocaleString('en-IN') || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-xs space-y-1">
                        {l.providerId?.payoutDetails?.bankName ? (
                          <>
                            <div className="text-white font-medium">{l.providerId.payoutDetails.bankName}</div>
                            <div className="text-gray-400">A/C: <span className="font-semibold text-white">{l.providerId.payoutDetails.accountNumber}</span></div>
                            <div className="text-gray-500">IFSC: <span className="font-semibold text-gray-400">{l.providerId.payoutDetails.ifscCode}</span></div>
                          </>
                        ) : (
                          <span className="text-amber-500 font-medium">Bank Details Not Configured</span>
                        )}
                      </td>
                      <td className="p-4 text-xs space-y-1">
                        <div className="text-emerald-400 font-semibold">Earnings: ₹{l.hostEarnings?.toLocaleString('en-IN')}</div>
                        <div className="text-gray-500">Fee: ₹{l.platformCommission?.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2.5 py-1 border rounded-full font-bold uppercase tracking-wider ${getStatusBadge(l.payoutStatus)}`}>
                          {l.payoutStatus || 'PENDING'}
                        </span>
                        {l.payoutStatus === 'PAID' && (
                          <div className="text-[9px] font-mono text-gray-500 mt-1">tx: {l.gatewayTransferId?.slice(0, 10)}...</div>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {l.payoutStatus === 'PENDING' ? (
                          <button
                            onClick={() => handleProcessPayout(l._id)}
                            disabled={actionLoading !== null || !l.providerId?.payoutDetails?.bankName}
                            className="py-2 px-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40 shadow-sm transition-all"
                          >
                            {actionLoading === l._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Process Payout'
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Processed</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookings;
