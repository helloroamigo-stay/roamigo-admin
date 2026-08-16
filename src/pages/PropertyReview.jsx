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
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
      case 'PENDING_APPROVAL':
        return 'bg-brand-950/60 text-brand-400 border-brand-800/80';
      case 'REJECTED':
        return 'bg-red-950/60 text-red-400 border-red-800/80';
      case 'SUSPENDED':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/80';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Fetching listing audit data...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Link to="/properties" className="flex items-center gap-2 text-xs text-brand-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties Catalog</span>
        </Link>
        <div className="bg-red-950/30 border border-red-900/50 p-6 rounded-2xl text-red-300 text-sm">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] border border-gray-800 p-5 rounded-3xl">
        <div className="flex items-center gap-4">
          <Link
            to="/properties"
            className="p-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-2xl transition-all cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{property.title}</h1>
              <span className={`text-xs px-3 py-1 rounded-xl font-bold uppercase tracking-wider border ${getStatusBadge(property.status)}`}>
                {property.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>{property.address}, {property.cityId?.name || property.city || 'India'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">Status:</span>
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
                className="flex items-center gap-1.5 py-2.5 px-4 bg-red-950/40 border border-red-900/60 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-1.5 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/10"
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
        <div className="relative aspect-video max-h-[500px] w-full rounded-3xl overflow-hidden border border-gray-800 bg-gray-900">
          {currentImage ? (
            <img
              src={getFullUploadUrl(currentImage)}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <Home className="w-16 h-16" />
            </div>
          )}
          <div className="absolute top-4 right-4 bg-gray-950/80 backdrop-blur-md border border-gray-800 text-white font-mono font-bold text-sm px-4 py-2 rounded-2xl">
            ₹{property.pricePerNight?.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400">/night</span>
          </div>
        </div>

        {/* Thumbnails list */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-28 aspect-video rounded-xl overflow-hidden border cursor-pointer transition-all shrink-0 ${
                  activeImageIndex === idx ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-800 opacity-60 hover:opacity-100'
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#0f172a] border border-gray-800 rounded-3xl text-xs">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <span className="text-gray-500 block">Capacity</span>
                <span className="font-semibold text-white">{property.guestsMax || 2} Guests</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BedDouble className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <span className="text-gray-500 block">Bedrooms</span>
                <span className="font-semibold text-white">{property.bedrooms || 1} Rooms</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bath className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <span className="text-gray-500 block">Bathrooms</span>
                <span className="font-semibold text-white">{property.bathrooms || 1} Baths</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <span className="text-gray-500 block">Property Type</span>
                <span className="font-semibold text-white">{property.propertyType || 'VILLA'}</span>
              </div>
            </div>
          </div>

          {/* Description & Tagline */}
          <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Overview & Description</span>
            </h3>
            {property.tagline && (
              <p className="text-sm font-semibold text-brand-300 italic">"{property.tagline}"</p>
            )}
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {property.description || 'No description provided for this listing.'}
            </p>
          </div>

          {/* Spaces & Villa Layout */}
          {(property.spaces || []).length > 0 && (
            <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Home className="w-4 h-4 text-brand-400" />
                <span>Spaces & Villa Layout</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.spaces.map((space, idx) => (
                  <div key={idx} className="bg-gray-900/60 border border-gray-850 p-4 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-white block">{space.title}</span>
                    <p className="text-xs text-gray-400">{space.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dining & Meal Menu Package */}
          {(property.mealsDescription || property.mealsPdf || property.mealsImage) && (
            <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                <span>Meals Menu & Culinary Details</span>
              </h3>

              {property.mealsDescription && (
                <p className="text-xs text-gray-300 leading-relaxed">{property.mealsDescription}</p>
              )}

              {property.mealsPdf && (
                <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-red-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">Official Meal Menu Document</span>
                      <span className="text-[10px] text-gray-400">Uploaded PDF menu brochure</span>
                    </div>
                  </div>
                  <a
                    href={getFullUploadUrl(property.mealsPdf)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 py-2 px-4 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-900/50 rounded-xl text-xs font-semibold transition-all"
                  >
                    <span>View PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Home Truths & House Rules */}
          {(property.homeTruths || []).length > 0 && (
            <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-400" />
                <span>Home Truths & House Rules</span>
              </h3>
              <ul className="space-y-2">
                {property.homeTruths.map((truth, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                    <span>{truth}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nearby Places */}
          {(property.nearbyPlaces || []).length > 0 && (
            <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-400" />
                <span>Nearby Places & Attractions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.nearbyPlaces.map((place, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-850 rounded-2xl text-xs">
                    <span className="font-semibold text-white">{place.name}</span>
                    <span className="text-[11px] text-brand-400 bg-brand-950/60 border border-brand-900/50 px-2.5 py-1 rounded-lg font-mono">
                      {place.distance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities Grid */}
          <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Included Amenities</h3>
            {(property.amenities || []).length === 0 ? (
              <p className="text-xs text-gray-500">No amenities selected.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold text-gray-200 bg-gray-900 border border-gray-800 px-3.5 py-2 rounded-xl"
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
          <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Host / Owner Info</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-base border border-brand-500/20 shrink-0">
                {property.providerId?.name?.slice(0, 2).toUpperCase() || 'HO'}
              </div>
              <div className="truncate">
                <span className="font-bold text-white text-sm block truncate">{property.providerId?.name || 'Independent Host'}</span>
                <span className="text-xs text-gray-400 block truncate">{property.providerId?.email || 'No email registered'}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-850 pt-4 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Account Role:</span>
                <span className="font-semibold text-white">{property.providerId?.role || 'USER'}</span>
              </div>
              {property.providerId?.phone && (
                <div className="flex justify-between text-gray-400">
                  <span>Phone Contact:</span>
                  <span className="font-semibold text-white">{property.providerId.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Map Link */}
          {property.googleMapsUrl && (
            <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Map Coordinates</h3>
              <a
                href={property.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-2xl text-xs font-semibold transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Open Google Maps Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Admin Verification Card */}
          <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Admin Decision Box</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Verify listing photo quality, address accuracy, pricing consistency, and owner credentials before publishing.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleApprove}
                disabled={actionLoading || property.status === 'PUBLISHED'}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Publish Listing</span>
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading || property.status === 'REJECTED'}
                className="w-full py-3 bg-red-950/40 border border-red-900/60 hover:bg-red-900/50 disabled:opacity-50 text-red-300 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
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
