import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  UserCheck,
  UserMinus,
  UserX,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Award,
  Clock
} from 'lucide-react';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getProviders();
      setProviders(res.data?.providers || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Could not fetch registered host providers.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to verify and approve this host operator? They will receive full property publishing access.')) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.approveProvider(id);
      fetchProviders();
    } catch (err) {
      alert(err.message || 'Verification approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this host registration?')) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.rejectProvider(id);
      fetchProviders();
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Are you sure you want to suspend this provider? This will deactivate their listed properties and block login.')) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.suspendProvider(id);
      fetchProviders();
    } catch (err) {
      alert(err.message || 'Suspension failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-full px-3 py-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-950/20 border border-red-900/30 rounded-full px-3 py-1 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-950/20 border border-amber-900/30 rounded-full px-3 py-1 w-fit">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Suspended</span>
          </span>
        );
      case 'REGISTERED':
      case 'PENDING_VERIFICATION':
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-450 bg-amber-950/20 border border-amber-500/20 rounded-full px-3 py-1 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  if (loading && providers.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Fetching provider network logs...</p>
      </div>
    );
  }

  // Summary counts
  const totalCount = providers.length;
  const pendingCount = providers.filter(p =>
    p.approvalStatus === 'REGISTERED' ||
    p.approvalStatus === 'PENDING_VERIFICATION' ||
    p.approvalStatus === 'PENDING' ||
    p.approvalStatus === 'PENDING_APPROVAL'
  ).length;
  const verifiedCount = providers.filter(p => p.approvalStatus === 'APPROVED').length;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Hosts</span>
          <h3 className="text-2xl font-bold text-white mt-2">{totalCount}</h3>
        </div>
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Awaiting Verification</span>
          <h3 className="text-2xl font-bold text-amber-400 mt-2">{pendingCount}</h3>
        </div>
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Verified Partners</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-2">{verifiedCount}</h3>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-300 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Grid of Providers */}
      {providers.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-sm border border-dashed border-gray-800 rounded-3xl">
          No registered host providers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((p) => (
            <div
              key={p._id}
              className="bg-[#0f172a] border border-gray-800 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-gray-700 transition-all duration-300"
            >
              {/* Top Row: Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {p.userId?.avatar ? (
                      <img
                        src={p.userId.avatar}
                        alt={p.userId.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-base">
                        {p.userId?.name?.slice(0, 2).toUpperCase() || 'AD'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>{p.userId?.name}</span>
                        {p.superhost && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-950/20 border border-amber-900/30 rounded px-1.5 py-0.5">
                            <Award className="w-3 h-3 shrink-0" />
                            <span>Superhost</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                        <Building className="w-3.5 h-3.5 text-brand-400" />
                        <span>{p.businessName || 'Independent Host'}</span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(p.approvalStatus)}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed bg-gray-900/40 border border-gray-850 p-3.5 rounded-2xl">
                  {p.bio ? `"${p.bio}"` : 'No bio profile entered.'}
                </p>

                {/* Contact & stats details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="truncate">{p.userId?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>{p.userId?.phone || 'No phone'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-gray-500 border-l border-gray-850 pl-4">
                    <div>Rating: <span className="text-white font-semibold">{p.rating ? `${p.rating}/5` : 'N/A'}</span></div>
                    <div>Reviews Count: <span className="text-white font-semibold">{p.reviewsCount || 0}</span></div>
                    <div>Response Rate: <span className="text-white font-semibold">{p.responseRate || '100%'}</span></div>
                  </div>
                </div>
              </div>

              {/* Actions Area */}
              <div className="flex flex-wrap items-center gap-3 border-t border-gray-850 pt-4">
                {/* Pending operators can be approved or rejected */}
                {(['REGISTERED', 'PENDING_VERIFICATION', 'PENDING', 'PENDING_APPROVAL', 'REJECTED'].includes(p.approvalStatus)) && (
                  <button
                    onClick={() => handleApprove(p._id)}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {(['REGISTERED', 'PENDING_VERIFICATION', 'PENDING', 'PENDING_APPROVAL', 'APPROVED'].includes(p.approvalStatus)) && (
                  <button
                    onClick={() => handleReject(p._id)}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-gray-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 text-gray-300 border border-transparent hover:border-transparent rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}

                {p.approvalStatus === 'APPROVED' && (
                  <button
                    onClick={() => handleSuspend(p._id)}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-gray-800 hover:bg-red-950/20 hover:text-red-400 text-gray-300 border border-transparent rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all ml-auto"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Suspend Host</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Providers;
