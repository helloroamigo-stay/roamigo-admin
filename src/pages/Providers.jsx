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
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1 w-fit">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Rejected</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 w-fit">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Suspended</span>
          </span>
        );
      case 'REGISTERED':
      case 'PENDING_VERIFICATION':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  if (loading && providers.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Fetching provider network logs...</p>
      </div>
    );
  }

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
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Hosts</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Awaiting Verification</span>
          <h3 className="text-2xl font-bold text-amber-600 mt-2">{pendingCount}</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Verified Partners</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">{verifiedCount}</h3>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Grid of Providers */}
      {providers.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-3xl bg-white shadow-xs">
          No registered host providers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-slate-300 shadow-xs transition-all duration-300"
            >
              {/* Top Row: Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {p.userId?.avatar ? (
                      <img
                        src={p.userId.avatar}
                        alt={p.userId.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-base">
                        {p.userId?.name?.slice(0, 2).toUpperCase() || 'AD'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{p.userId?.name}</span>
                        {p.superhost && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                            <Award className="w-3 h-3 shrink-0 text-amber-600" />
                            <span>Superhost</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Building className="w-3.5 h-3.5 text-brand-600" />
                        <span>{p.businessName || 'Independent Host'}</span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(p.approvalStatus)}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  {p.bio ? `"${p.bio}"` : 'No bio profile entered.'}
                </p>

                {/* Contact & stats details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{p.userId?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{p.userId?.phone || 'No phone'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-slate-500 border-l border-slate-200 pl-4">
                    <div>Rating: <span className="text-slate-900 font-bold">{p.rating ? `${p.rating}/5` : 'N/A'}</span></div>
                    <div>Reviews Count: <span className="text-slate-900 font-bold">{p.reviewsCount || 0}</span></div>
                    <div>Response Rate: <span className="text-slate-900 font-bold">{p.responseRate || '100%'}</span></div>
                  </div>
                </div>
              </div>

              {/* Actions Area */}
              <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
                {(['REGISTERED', 'PENDING_VERIFICATION', 'PENDING', 'PENDING_APPROVAL', 'REJECTED'].includes(p.approvalStatus)) && (
                  <button
                    onClick={() => handleApprove(p._id)}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-xs transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {(['REGISTERED', 'PENDING_VERIFICATION', 'PENDING', 'PENDING_APPROVAL', 'APPROVED'].includes(p.approvalStatus)) && (
                  <button
                    onClick={() => handleReject(p._id)}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}

                {p.approvalStatus === 'APPROVED' && (
                  <button
                    onClick={() => handleSuspend(p._id)}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all ml-auto"
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
