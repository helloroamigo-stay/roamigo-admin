import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Check, 
  X, 
  Home, 
  MapPin, 
  DollarSign, 
  User, 
  Users, 
  BedDouble, 
  Bath, 
  Loader2,
  AlertCircle
} from 'lucide-react';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING_APPROVAL');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getProperties();
      setProperties(res.data?.properties || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Could not retrieve property listings database records.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve and publish this property listing? It will immediately go live on the Roamigo marketplace.')) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.approveProperty(id);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Listing approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this property listing request?')) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.rejectProperty(id);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Listing rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this active listing? It will be hidden from search results but retain all booking logs.')) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.suspendProperty(id);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Suspension failed.');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter properties based on tab
  const filteredProperties = properties.filter((p) => {
    if (activeTab === 'PENDING_APPROVAL') {
      return p.status === 'PENDING_APPROVAL';
    } else if (activeTab === 'PUBLISHED') {
      return p.status === 'PUBLISHED';
    } else {
      // Other contains DRAFT, REJECTED, SUSPENDED, ARCHIVED
      return ['DRAFT', 'REJECTED', 'SUSPENDED', 'ARCHIVED'].includes(p.status);
    }
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
      case 'PENDING_APPROVAL':
        return 'bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse';
      case 'SUSPENDED':
        return 'bg-amber-600/10 border-amber-600/20 text-amber-500';
      case 'REJECTED':
        return 'bg-red-500/10 border-red-500/25 text-red-400';
      default:
        return 'bg-gray-800 border-gray-700 text-gray-400';
    }
  };

  if (loading && properties.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading properties database...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Tab Switcher & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex bg-gray-900/80 p-1 border border-gray-850 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('PENDING_APPROVAL')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'PENDING_APPROVAL'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>Awaiting Review</span>
            <span className="text-[10px] px-2 py-0.5 bg-gray-950/80 border border-gray-850 text-brand-400 rounded-full font-bold">
              {properties.filter(p => p.status === 'PENDING_APPROVAL').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PUBLISHED')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'PUBLISHED'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>Active Listings</span>
            <span className="text-[10px] px-2 py-0.5 bg-gray-950/80 border border-gray-850 text-emerald-400 rounded-full font-bold">
              {properties.filter(p => p.status === 'PUBLISHED').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('OTHER')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'OTHER'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>Drafts & Suspended</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-300 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Grid of properties */}
      {filteredProperties.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-sm border border-dashed border-gray-800 rounded-3xl">
          No property listings found matching this status.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProperties.map((p) => (
            <div 
              key={p._id} 
              className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-gray-700 transition-all duration-300"
            >
              {/* Photo carousel simulation / info header */}
              <div className="relative h-56 w-full bg-gray-900">
                {p.images?.[0] ? (
                  <img 
                    src={p.images[0]} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-850">
                    <Home className="w-10 h-10" />
                  </div>
                )}
                {/* Labels overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/10 to-transparent p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white bg-gray-950/80 border border-gray-800 px-3 py-1.5 rounded-xl font-mono">
                      {p.propertyType || 'VILLA'}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{p.title}</h3>
                    <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span>{p.address}, {p.cityId?.name || p.city}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Specs & Owner info */}
              <div className="p-6 flex flex-col justify-between flex-1 gap-5">
                <div className="space-y-4">
                  {/* Grid details */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 bg-gray-900/50 border border-gray-850 p-3 rounded-2xl w-fit">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-brand-400" />
                      <span>{p.guestsMax || 2} Guests</span>
                    </div>
                    <span className="text-gray-800">|</span>
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4 text-brand-400" />
                      <span>{p.bedrooms || 1} Bed</span>
                    </div>
                    <span className="text-gray-800">|</span>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4 text-brand-400" />
                      <span>{p.bathrooms || 1} Bath</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {p.description || 'No listing description provided.'}
                  </p>

                  {/* Owner Provider Profile */}
                  <div className="flex items-center justify-between bg-gray-900/35 border border-gray-850/80 p-3 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-400 shrink-0" />
                      <div>
                        <span className="text-gray-500">Listed by: </span>
                        <span className="font-semibold text-white">{p.providerId?.userId?.name || 'Independent Partner'}</span>
                      </div>
                    </div>
                    <span className="text-white font-bold text-sm">₹{p.pricePerNight?.toLocaleString('en-IN')}<span className="text-[10px] text-gray-500 font-normal">/night</span></span>
                  </div>
                </div>

                {/* Approvals Action Bar */}
                <div className="flex items-center gap-3 border-t border-gray-850 pt-4 mt-1">
                  {(p.status === 'PENDING_APPROVAL' || p.status === 'REJECTED' || p.status === 'SUSPENDED') && (
                    <button
                      onClick={() => handleApprove(p._id)}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-emerald-500/5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Publish</span>
                    </button>
                  )}

                  {(p.status === 'PENDING_APPROVAL' || p.status === 'PUBLISHED') && (
                    <button
                      onClick={() => handleReject(p._id)}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gray-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 text-gray-300 border border-transparent rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Request</span>
                    </button>
                  )}

                  {p.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleSuspend(p._id)}
                      disabled={actionLoading !== null}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gray-800 hover:bg-red-950/20 hover:text-red-400 text-gray-300 border border-transparent rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all ml-auto w-fit"
                    >
                      <span>Suspend Listing</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;
