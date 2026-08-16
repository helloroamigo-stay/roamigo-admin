import React from 'react';
import { Link } from 'react-router-dom';
import { Select } from 'antd';
import {
  Home,
  MapPin,
  User,
  Users,
  BedDouble,
  Bath,
  Loader2,
  Edit,
  Check,
  Star,
  Eye
} from 'lucide-react';
import { getFullUploadUrl, adminAPI } from '../../services/api';

export const PropertyCard = ({
  property: p,
  actionLoading,
  setActionLoading,
  onOpenEditModal,
  onApprove,
  onToggleFeatured,
  onStatusChange,
  getStatusStyle
}) => {
  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-gray-700 transition-all duration-300">
      {/* Photo carousel simulation / info header */}
      <div className="relative h-56 w-full bg-gray-900">
        {p.images?.[0] ? (
          <img
            src={getFullUploadUrl(p.images[0])}
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

            <div className="flex items-center gap-2">
              {/* Featured Toggle Icon */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(p);
                }}
                disabled={actionLoading === p._id}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-md duration-300 ${p.featured
                    ? 'bg-amber-500/25 border-amber-500/40 text-amber-300 hover:bg-amber-500/40'
                    : 'bg-gray-950/85 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
                  }`}
                title={p.featured ? 'Featured listing (Click to remove)' : 'Mark listing as featured'}
              >
                {actionLoading === p._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Star className={`w-3.5 h-3.5 transition-all duration-300 ${p.featured ? 'fill-amber-400 text-amber-400 scale-110' : ''}`} />
                )}
              </button>

              <span className={`text-[10px] px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider border ${getStatusStyle(p.status)}`}>
                {p.status}
              </span>
            </div>
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
                <span className="font-semibold text-white">{p.providerId?.name || p.providerId?.userId?.name || 'Independent Host'}</span>
              </div>
            </div>
            <span className="text-white font-bold text-sm">₹{p.pricePerNight?.toLocaleString('en-IN')}<span className="text-[10px] text-gray-500 font-normal">/night</span></span>
          </div>
        </div>

        {/* Approvals Action Bar with Ant Design Select */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-850 pt-4 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Status:</span>
            <Select
              value={p.status}
              disabled={actionLoading === p._id}
              onChange={(newStatus) => onStatusChange(p._id, newStatus)}
              className="w-44"
              options={[
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'PENDING_APPROVAL', label: 'Pending Review' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'SUSPENDED', label: 'Suspended' },
                { value: 'DRAFT', label: 'Draft' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/properties/review/${p._id}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0"
            >
              <Eye className="w-4 h-4" />
              <span>Review</span>
            </Link>

            <button
              onClick={() => onOpenEditModal(p)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-800 hover:bg-brand-500/10 hover:text-brand-400 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            {p.status === 'PENDING_APPROVAL' && (
              <button
                onClick={() => onApprove(p._id)}
                disabled={actionLoading !== null}
                className="flex items-center justify-center gap-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-emerald-500/5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
