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
import { getFullUploadUrl } from '../../services/api';

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
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300">
      {/* Photo carousel simulation / info header */}
      <div className="relative h-56 w-full bg-slate-100">
        {p.images?.[0] ? (
          <img
            src={getFullUploadUrl(p.images[0])}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
            <Home className="w-10 h-10" />
          </div>
        )}
        {/* Labels overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-900 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-xl font-mono shadow-xs">
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
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs duration-300 ${
                  p.featured
                    ? 'bg-amber-500 border-amber-400 text-white hover:bg-amber-600'
                    : 'bg-white/90 border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-300'
                }`}
                title={p.featured ? 'Featured listing (Click to remove)' : 'Mark listing as featured'}
              >
                {actionLoading === p._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Star className={`w-3.5 h-3.5 transition-all duration-300 ${p.featured ? 'fill-white text-white scale-110' : ''}`} />
                )}
              </button>

              <span className={`text-[10px] px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider border bg-white/95 shadow-xs ${getStatusStyle(p.status)}`}>
                {p.status}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{p.title}</h3>
            <p className="text-xs text-slate-200 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-300 shrink-0" />
              <span>{p.address}, {p.cityId?.name || p.city}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Specs & Owner info */}
      <div className="p-6 flex flex-col justify-between flex-1 gap-5">
        <div className="space-y-4">
          {/* Grid details */}
          <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-2xl w-fit">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-brand-600" />
              <span>{p.guestsMax || 2} Guests</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-medium">
              <BedDouble className="w-4 h-4 text-brand-600" />
              <span>{p.bedrooms || 1} Bed</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-medium">
              <Bath className="w-4 h-4 text-brand-600" />
              <span>{p.bathrooms || 1} Bath</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {p.description || 'No listing description provided.'}
          </p>

          {/* Owner Provider Profile */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <span className="text-slate-500">Listed by: </span>
                <span className="font-bold text-slate-900">{p.providerId?.name || p.providerId?.userId?.name || 'Independent Host'}</span>
              </div>
            </div>
            <span className="text-slate-900 font-bold text-sm">₹{p.pricePerNight?.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-normal">/night</span></span>
          </div>
        </div>

        {/* Approvals Action Bar with Ant Design Select */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold">Status:</span>
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
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0"
            >
              <Eye className="w-4 h-4" />
              <span>Review</span>
            </Link>

            <Link
              to={`/properties/edit/${p._id}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
            {p.status === 'PENDING_APPROVAL' && (
              <button
                onClick={() => onApprove(p._id)}
                disabled={actionLoading !== null}
                className="flex items-center justify-center gap-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-xs shrink-0"
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
