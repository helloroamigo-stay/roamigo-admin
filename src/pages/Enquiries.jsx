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
  Users as GuestsIcon,
  Send,
  MessageSquareQuote
} from 'lucide-react';
import { Modal, message } from 'antd';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Accept & Email Modal State
  const [selectedEnquiryForAccept, setSelectedEnquiryForAccept] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [accepting, setAccepting] = useState(false);

  const filterTabs = [
    { id: 'ALL', label: 'All Enquiries' },
    { id: 'PENDING_APPROVAL', label: 'Pending Review' },
    { id: 'PENDING_PAYMENT', label: 'Awaiting Payment' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

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

  const handleOpenAcceptModal = (enq) => {
    setSelectedEnquiryForAccept(enq);
    setCustomMessage(
      `We are pleased to accept your booking enquiry for ${enq.propertyId?.title || 'your stay'}! Your requested dates are now locked for you. Please complete payment within 24 hours to secure your reservation.`
    );
  };

  const handleConfirmEnquiry = async () => {
    if (!selectedEnquiryForAccept) return;
    try {
      setAccepting(true);
      const res = await adminAPI.confirmEnquiry(selectedEnquiryForAccept._id, {
        message: customMessage.trim(),
      });
      message.success(
        res.message || 'Enquiry accepted, calendar dates locked, and email sent to guest successfully!'
      );
      setSelectedEnquiryForAccept(null);
      setCustomMessage('');
      fetchEnquiries();
    } catch (err) {
      console.error('Error accepting enquiry:', err);
      message.error(err.message || 'Failed to accept enquiry.');
    } finally {
      setAccepting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'PAID':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'PENDING':
      case 'PENDING_APPROVAL':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 w-fit">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Awaiting Payment</span>
          </span>
        );
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
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

  const filteredEnquiries = enquiries.filter((enq) => {
    const code = enq.bookingCode || enq._id || '';
    const guestName = enq.customerId?.name || enq.guestInfo?.name || '';
    const guestEmail = enq.customerId?.email || enq.guestInfo?.email || '';
    const guestPhone = enq.customerId?.phone || enq.guestInfo?.phone || '';
    const propTitle = enq.propertyId?.title || '';

    const matchesSearch =
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING_APPROVAL' && (enq.status === 'PENDING' || enq.status === 'PENDING_APPROVAL')) ||
      (statusFilter === 'PENDING_PAYMENT' && enq.status === 'PENDING_PAYMENT') ||
      (statusFilter === 'CONFIRMED' && (enq.status === 'CONFIRMED' || enq.status === 'COMPLETED' || enq.status === 'PAID')) ||
      (statusFilter === 'CANCELLED' && (enq.status === 'CANCELLED' || enq.status === 'REJECTED' || enq.status === 'FAILED'));

    return matchesSearch && matchesStatus;
  });

  const totalCount = enquiries.length;
  const pendingCount = enquiries.filter((e) =>
    ['PENDING', 'PENDING_APPROVAL'].includes(e.status)
  ).length;
  const awaitingPaymentCount = enquiries.filter((e) =>
    e.status === 'PENDING_PAYMENT'
  ).length;
  const confirmedCount = enquiries.filter((e) =>
    ['CONFIRMED', 'COMPLETED', 'PAID'].includes(e.status)
  ).length;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
            <HelpCircle className="w-7 h-7 text-brand-600" />
            <span>Property Enquiries & Call Back Requests</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review guest reservation enquiries, accept requests, lock calendar dates, and automatically send customized email confirmations.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Enquiries
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending Review
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Awaiting Payment
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{awaitingPaymentCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Confirmed Bookings
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{confirmedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code, guest name, email, phone, property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1" />
          {filterTabs.map((tab) => (
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

      {/* Enquiries Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium">Loading property enquiries stream...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Enquiries</h3>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchEnquiries}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No enquiries found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Ref Code & Guest</th>
                  <th className="py-4 px-6">Target Property</th>
                  <th className="py-4 px-6">Stay Dates</th>
                  <th className="py-4 px-6">Guests</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Est. Price</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEnquiries.map((enq) => {
                  const guestName = enq.customerId?.name || enq.guestInfo?.name || 'Guest';
                  const guestEmail = enq.customerId?.email || enq.guestInfo?.email || 'N/A';
                  const guestPhone = enq.customerId?.phone || enq.guestInfo?.phone;
                  const guestNotes = enq.notes || enq.guestInfo?.notes || enq.guestInfo?.specialRequests;

                  return (
                    <tr key={enq._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ref Code & Guest */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-brand-600 text-xs">
                          #{enq.bookingCode || enq._id?.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-slate-900 font-bold text-sm mt-0.5">
                          {guestName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{guestEmail}</span>
                        </div>
                        {guestPhone && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{guestPhone}</span>
                          </div>
                        )}
                        {guestNotes && (
                          <p className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg mt-1 italic border border-slate-200 line-clamp-1 max-w-xs">
                            "{guestNotes}"
                          </p>
                        )}
                      </td>

                      {/* Target Property */}
                      <td className="py-4 px-6 max-w-[260px]">
                        <div className="flex items-start gap-2.5">
                          <Home className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <div className="text-slate-900 font-medium truncate">
                              {enq.propertyId?.title || 'Villa Property'}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {enq.propertyId?.address || 'India'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stay Dates */}
                      <td className="py-4 px-6 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {formatDate(enq.checkIn)} &ndash; {formatDate(enq.checkOut)}
                          </span>
                        </div>
                      </td>

                      {/* Guests */}
                      <td className="py-4 px-6 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <GuestsIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{enq.guests || enq.guestsCount || 1} Guests</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">{getStatusBadge(enq.status)}</td>

                      {/* Est. Price */}
                      <td className="py-4 px-6 text-right font-bold text-slate-900 text-base">
                        ₹{enq.totalAmount?.toLocaleString('en-IN') || '0'}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center">
                        {enq.status === 'PENDING_APPROVAL' || enq.status === 'PENDING' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAcceptModal(enq)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs transition-all hover:scale-105"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Accept & Mail</span>
                          </button>
                        ) : enq.status === 'PENDING_PAYMENT' ? (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            Awaiting Payment
                          </span>
                        ) : enq.status === 'CONFIRMED' || enq.status === 'PAID' ? (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            Confirmed
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Action</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accept & Email Modal */}
      <Modal
        open={!!selectedEnquiryForAccept}
        onCancel={() => {
          setSelectedEnquiryForAccept(null);
          setCustomMessage('');
        }}
        footer={null}
        centered
        width={580}
      >
        <div className="p-4 space-y-5 text-left font-sans">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Accept Enquiry & Send Mail</h3>
              <p className="text-xs text-slate-500">Lock stay dates and notify guest via email</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-2">
              <p>
                <strong className="text-slate-900">Enquiry Code:</strong> #
                {selectedEnquiryForAccept?.bookingCode}
              </p>
              <p>
                <strong className="text-slate-900">Guest Name:</strong>{' '}
                {selectedEnquiryForAccept?.customerId?.name ||
                  selectedEnquiryForAccept?.guestInfo?.name ||
                  'Guest'}
              </p>
              <p>
                <strong className="text-slate-900">Guest Email:</strong>{' '}
                <span className="text-blue-600 font-semibold">
                  {selectedEnquiryForAccept?.customerId?.email ||
                    selectedEnquiryForAccept?.guestInfo?.email ||
                    'N/A'}
                </span>
              </p>
              <p>
                <strong className="text-slate-900">Total Payable:</strong> ₹
                {selectedEnquiryForAccept?.totalAmount?.toLocaleString('en-IN')}
              </p>
            </div>
            <p className="pt-1 border-t border-slate-200">
              <strong className="text-slate-900">Property:</strong>{' '}
              {selectedEnquiryForAccept?.propertyId?.title}
            </p>
            <p>
              <strong className="text-slate-900">Stay Dates:</strong>{' '}
              <span className="font-semibold text-emerald-700">
                {formatDate(selectedEnquiryForAccept?.checkIn)} to{' '}
                {formatDate(selectedEnquiryForAccept?.checkOut)}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4 text-brand-600" />
              <span>Personal Note / Message to Guest (Included in Email):</span>
            </label>
            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter a message to the guest that will be delivered in their confirmation email..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all resize-none"
            />
            <p className="text-[11px] text-slate-400">
              The guest will receive a formal confirmation email containing all stay specs, this note, and a direct link to complete their payment.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setSelectedEnquiryForAccept(null);
                setCustomMessage('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={accepting}
              onClick={handleConfirmEnquiry}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all hover:scale-105"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locking Dates & Sending Mail...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Approve Enquiry & Send Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Enquiries;
