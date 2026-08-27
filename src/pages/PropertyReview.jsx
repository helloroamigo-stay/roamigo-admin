import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, getFullUploadUrl } from '../services/api';
import { Select } from 'antd';
import {
  ArrowLeft,
  Check,
  X,
  MapPin,
  User,
  Users,
  BedDouble,
  Bath,
  Loader2,
  Edit,
  FileText,
  Home,
  Info,
  Compass,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react';

const PropertyReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchPropertyDetail();
  }, [id]);

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getPropertyById(id);
      setProperty(res.data?.property || null);
    } catch (err) {
      console.error('Error fetching property detail:', err);
      setError(err.message || 'Failed to load property details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await adminAPI.approveProperty(id);
      await fetchPropertyDetail();
    } catch (err) {
      alert(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      await adminAPI.rejectProperty(id);
      await fetchPropertyDetail();
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      await adminAPI.updatePropertyStatus(id, newStatus);
      await fetchPropertyDetail();
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'SUSPENDED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Fetching listing audit data...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 font-sans">
        <Link to="/properties" className="flex items-center gap-2 text-xs text-brand-600 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties Catalog</span>
        </Link>
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-700 text-sm">
          {error || 'Property not found.'}
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [];
  const currentImage = images[activeImageIndex] || images[0];

  return (
    <div className="p-6 sm:p-8 max-w-[1500px] mx-auto space-y-8 font-sans">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            to="/properties"
            className="p-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{property.title}</h1>
              <span className={`text-xs px-3 py-1 rounded-xl font-bold uppercase tracking-wider border ${getStatusBadge(property.status)}`}>
                {property.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>{property.address}, {property.cityId?.name || property.city || 'India'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold hidden sm:inline">Status:</span>
            <Select
              value={property.status}
              disabled={actionLoading}
              onChange={handleStatusChange}
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

          {property.status === 'PENDING_APPROVAL' && (
            <>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex items-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-1.5 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Approve & Publish</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Image Showcase */}
      <div className="space-y-4">
        <div className="relative aspect-video max-h-[500px] w-full rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
          {currentImage ? (
            <img
              src={getFullUploadUrl(currentImage)}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Home className="w-16 h-16" />
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 font-mono font-bold text-sm px-4 py-2 rounded-2xl shadow-xs">
            ₹{property.pricePerNight?.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/night</span>
          </div>
        </div>

        {/* Thumbnails list */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-28 aspect-video rounded-xl overflow-hidden border cursor-pointer transition-all shrink-0 ${activeImageIndex === idx ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
              >
                <img src={getFullUploadUrl(img)} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Detailed Specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-slate-200 rounded-3xl text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">Capacity</span>
                <span className="font-bold text-slate-900">{property.guestsMax || 2} Guests</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BedDouble className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">Bedrooms</span>
                <span className="font-bold text-slate-900">{property.bedrooms || 1} Rooms</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bath className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">Bathrooms</span>
                <span className="font-bold text-slate-900">{property.bathrooms || 1} Baths</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">Property Type</span>
                <span className="font-bold text-slate-900">{property.propertyType || 'VILLA'}</span>
              </div>
            </div>
          </div>

          {/* Description & Tagline */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Overview & Description</span>
            </h3>
            {property.tagline && (
              <p className="text-sm font-semibold text-brand-600 italic">"{property.tagline}"</p>
            )}
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description || 'No description provided for this listing.'}
            </p>
          </div>

          {/* Spaces & Villa Layout */}
          {(property.spaces || []).length > 0 && (
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Home className="w-4 h-4 text-brand-600" />
                <span>Spaces & Villa Layout</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.spaces.map((space, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex gap-3 items-start">
                    {space.image && (
                      <img
                        src={getFullUploadUrl(space.image)}
                        alt={space.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="space-y-1 flex-1">
                      <span className="text-xs font-bold text-slate-900 block">{space.title}</span>
                      <p className="text-xs text-slate-600">{space.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dining & Meal Menu Package */}
          {(property.mealsDescription || property.mealsPdf || property.mealsImage) && (
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Meals Menu & Culinary Details</span>
              </h3>

              {property.mealsDescription && (
                <p className="text-xs text-slate-600 leading-relaxed">{property.mealsDescription}</p>
              )}

              {property.mealsPdf && (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Official Meal Menu Document</span>
                      <span className="text-[10px] text-slate-500">Uploaded PDF menu brochure</span>
                    </div>
                  </div>
                  <a
                    href={getFullUploadUrl(property.mealsPdf)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-all"
                  >
                    <span>View PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Home Truths & House Rules */}
          {(() => {
            const parseList = (data) => {
              if (!data) return [];
              if (Array.isArray(data)) return data.flatMap(item => typeof item === 'string' ? item.split('\n') : []).map(s => s.trim()).filter(Boolean);
              if (typeof data === 'string') return data.split('\n').map(s => s.trim()).filter(Boolean);
              return [];
            };
            const list = [...parseList(property.homeTruths), ...parseList(property.houseRules)];
            if (list.length === 0) return null;
            return (
              <div className="border border-slate-200 p-6 rounded-3xl space-y-3">
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Info className="w-4 h-4 text-brand-600" />
                  <span>Home Truths & House Rules</span>
                </h3>
                <ul className="space-y-2">
                  {list.map((truth, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      {/* <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 shrink-0" /> */}
                      <span>{truth}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Nearby Places */}
          {(property.nearbyPlaces || []).length > 0 && (
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-600" />
                <span>Nearby Places & Attractions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.nearbyPlaces.map((place, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                    <span className="font-bold text-slate-900">{place.name}</span>
                    <span className="text-[11px] text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg font-mono">
                      {place.distance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities Grid */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Included Amenities</h3>
            {(property.amenities || []).length === 0 ? (
              <p className="text-xs text-slate-400">No amenities selected.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Host & Listing Audit Card */}
        <div className="space-y-6">
          {/* Host Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Host / Owner Info</h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-base border border-brand-200 shrink-0">
                {property.providerId?.name?.slice(0, 2).toUpperCase() || 'HO'}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-900 text-sm block truncate">{property.providerId?.name || 'Independent Host'}</span>
                <span className="text-xs text-slate-500 block truncate">{property.providerId?.email || 'No email registered'}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Account Role:</span>
                <span className="font-bold text-slate-900">{property.providerId?.role || 'USER'}</span>
              </div>
              {property.providerId?.phone && (
                <div className="flex justify-between text-slate-600">
                  <span>Phone Contact:</span>
                  <span className="font-bold text-slate-900">{property.providerId.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Map Link */}
          {property.googleMapsUrl && (
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Map Coordinates</h3>
              <a
                href={property.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-2xl text-xs font-semibold transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Open Google Maps Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Admin Verification Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Decision Box</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verify listing photo quality, address accuracy, pricing consistency, and owner credentials before publishing.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleApprove}
                disabled={actionLoading || property.status === 'PUBLISHED'}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Publish Listing</span>
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading || property.status === 'REJECTED'}
                className="w-full py-3 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 disabled:opacity-50 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Reject Listing Application</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyReview;
