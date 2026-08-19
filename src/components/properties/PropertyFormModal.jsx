import React from 'react';
import {
  UploadCloud,
  Loader2,
  Trash2,
  FileText,
  X,
  Plus,
  Compass,
  Home,
  Info
} from 'lucide-react';
import { getFullUploadUrl } from '../../services/api';

const STANDARD_AMENITIES = [
  'Pet Friendly',
  'Private Pool',
  'Indoor Games',
  'Outdoor Games',
  'Lawn',
  'BBQ',
  'Music Speaker',
  'Gazebo',
  'Wi-fi',
  'TV',
  'Kitchen(Only Light Cooking)',
  'Kitchen Extra Cost',
  'Refrigerator',
  'Indoor Parking',
  'Outdoor Parking',
  'Balcony/ Terrace',
  'Water Purifier',
  'Driver/Staff Accommodation',
  'CCTV',
  'Fire Extinguisher',
  'Work Desk',
  'Bathroom',
  'Geyser',
  'Extra Mattress',
  'Toiletries',
  'Wardrobe',
  'Towels',
  'Outdoor Sitting Area'
];

export const PropertyFormModal = ({
  isOpen,
  onClose,
  editingPropertyId,
  form,
  setForm,
  providers,
  cities,
  collections,
  submitting,
  uploadingImages,
  uploadingPdf,
  onImageUpload,
  onRemoveImage,
  onPdfUpload,
  onRemovePdf,
  onSubmit
}) => {
  if (!isOpen) return null;

  // Dynamic Array Handlers
  const handleAddSpace = () => {
    setForm((prev) => ({
      ...prev,
      spaces: [...(prev.spaces || []), { title: '', desc: '' }]
    }));
  };

  const handleRemoveSpace = (index) => {
    setForm((prev) => ({
      ...prev,
      spaces: (prev.spaces || []).filter((_, i) => i !== index)
    }));
  };

  const handleSpaceChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...(prev.spaces || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, spaces: updated };
    });
  };

  const handleAddHomeTruth = () => {
    setForm((prev) => ({
      ...prev,
      homeTruths: [...(prev.homeTruths || []), '']
    }));
  };

  const handleRemoveHomeTruth = (index) => {
    setForm((prev) => ({
      ...prev,
      homeTruths: (prev.homeTruths || []).filter((_, i) => i !== index)
    }));
  };

  const handleHomeTruthChange = (index, value) => {
    setForm((prev) => {
      const updated = [...(prev.homeTruths || [])];
      updated[index] = value;
      return { ...prev, homeTruths: updated };
    });
  };

  const handleAddNearby = () => {
    setForm((prev) => ({
      ...prev,
      nearbyPlaces: [...(prev.nearbyPlaces || []), { name: '', distance: '', type: 'cafe' }]
    }));
  };

  const handleRemoveNearby = (index) => {
    setForm((prev) => ({
      ...prev,
      nearbyPlaces: (prev.nearbyPlaces || []).filter((_, i) => i !== index)
    }));
  };

  const handleNearbyChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...(prev.nearbyPlaces || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, nearbyPlaces: updated };
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">
            {editingPropertyId ? 'Edit Property Listing' : 'Add New Property Listing'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-all cursor-pointer text-sm font-semibold p-1 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Owner and Collection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Owner / Provider *</label>
              <select
                value={form.providerId}
                onChange={(e) => setForm({ ...form, providerId: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="">Select Provider</option>
                {providers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.businessName || p.userId?.name || 'Unknown'} ({p.userId?.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Collection Category</label>
              <select
                value={form.collectionId}
                onChange={(e) => setForm({ ...form, collectionId: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="">None (Standard Listing)</option>
                {collections.map((col) => (
                  <option key={col._id} value={col._id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title and Property Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Property Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. Whispering Pines Villa"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Property Type *</label>
              <select
                required
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="VILLA">Villa</option>
                <option value="APARTMENT">Apartment</option>
                <option value="COTTAGE">Cottage</option>
                <option value="MANSION">Mansion</option>
                <option value="CABIN">Cabin</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="ESTATE">Estate</option>
              </select>
            </div>
          </div>

          {/* Description and Tagline */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. Private infinity pool overlooking green valleys"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="Describe the villa space, layout, architecture..."
              />
            </div>
          </div>

          {/* Pricing & Capacity Specs */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Price / Night (₹) *</label>
              <input
                type="number"
                required
                value={form.pricePerNight}
                onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. 15000"
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Base Guests</label>
              <input
                type="number"
                value={form.baseGuests || 2}
                onChange={(e) => setForm({ ...form, baseGuests: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Guests Max *</label>
              <input
                type="number"
                required
                value={form.guestsMax}
                onChange={(e) => setForm({ ...form, guestsMax: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Kids</label>
              <input
                type="number"
                value={form.kidsCount || 0}
                onChange={(e) => setForm({ ...form, kidsCount: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Bedrooms *</label>
              <input
                type="number"
                required
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Bathrooms *</label>
              <input
                type="number"
                required
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                min="1"
              />
            </div>
          </div>

          {/* Location selection */}
          <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Location & Coordinates</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">City Selection *</label>
                <select
                  value={form.cityId}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    setForm({ ...form, cityId: selectedVal, city: selectedVal ? '' : form.city });
                  }}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="">Select Existing City</option>
                  {cities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                  <option value="">-- Add New City Instead --</option>
                </select>
              </div>

              {!form.cityId && (
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">New City Name *</label>
                  <input
                    type="text"
                    required={!form.cityId}
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Mahabaleshwar"
                  />
                </div>
              )}
            </div>

            {!form.cityId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Full Physical Address *</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. House No. 12, Valley View Road, Khas"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Google Maps Link (Optional)</label>
              <input
                type="url"
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                placeholder="e.g. https://maps.app.goo.gl/..."
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wide">Property Images *</label>

            {/* Image Thumbnails Previews */}
            {form.images.split(',').map((img) => img.trim()).filter(Boolean).length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-3 bg-gray-900/30 border border-gray-850 rounded-2xl">
                {form.images.split(',').map((img, idx) => {
                  const trimmedImg = img.trim();
                  return (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-800 bg-gray-900 group">
                      <img
                        src={getFullUploadUrl(trimmedImg)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-950/80 border border-red-900/50 text-red-400 p-1 rounded-md hover:bg-red-900 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload Zone & Manual URLs Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload Trigger Dropzone */}
              <div className="relative border border-dashed border-gray-800 hover:border-brand-500/50 rounded-2xl p-5 flex flex-col items-center justify-center bg-gray-900/20 transition-all min-h-[100px]">
                {uploadingImages ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                    <span className="text-xs text-gray-400">Uploading photos...</span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer w-full text-center">
                    <UploadCloud className="w-6 h-6 text-gray-500" />
                    <div>
                      <span className="text-xs font-semibold text-brand-400 hover:text-brand-300">Click to upload photos</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Supports PNG, JPG, JPEG (Max 10MB per file)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={onImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Manual Comma-Separated URL input fallback */}
              <div>
                <label className="block text-gray-500 text-[10px] font-semibold mb-1 uppercase">Fallback: Edit Photo URLs list directly</label>
                <textarea
                  required
                  rows={3}
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  placeholder="Or enter image links separated by commas..."
                />
              </div>
            </div>
          </div>

          {/* Meals & Menu Section */}
          <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Meals Menu & Dining Details</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Meal description text area */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Meals & Culinary Description</label>
                <textarea
                  value={form.mealsDescription}
                  onChange={(e) => setForm({ ...form, mealsDescription: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="Describe dining package, standard/custom kitchen, chef services, or meal rates..."
                />
              </div>

              {/* Meal PDF Menu Upload */}
              <div className="space-y-2">
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Property Meal Menu PDF</label>

                {form.mealsPdf ? (
                  <div className="flex items-center justify-between p-3.5 bg-gray-900 border border-gray-800 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-red-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-medium text-white truncate block">Meal Menu Document</span>
                        <a
                          href={getFullUploadUrl(form.mealsPdf)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-brand-400 hover:underline truncate block"
                        >
                          View PDF file
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onRemovePdf}
                      className="p-1.5 bg-gray-800 hover:bg-red-950/40 hover:text-red-400 text-gray-400 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-900/30"
                      title="Remove PDF"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed border-gray-800 hover:border-brand-500/50 rounded-xl p-5 flex flex-col items-center justify-center bg-gray-900/20 transition-all min-h-[90px]">
                    {uploadingPdf ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                        <span className="text-[11px] text-gray-400">Uploading PDF document...</span>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-1.5 cursor-pointer w-full text-center">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <span className="text-xs font-semibold text-brand-400 hover:text-brand-300">Upload Meal Menu PDF</span>
                          <p className="text-[9px] text-gray-500 mt-0.5">Supports PDF menu files up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={onPdfUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Property Spaces / Villa Highlights */}
          <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                <span>Spaces & Villa Layout Highlights</span>
              </h4>
              <button
                type="button"
                onClick={handleAddSpace}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Space</span>
              </button>
            </div>

            {(form.spaces || []).length === 0 ? (
              <p className="text-xs text-gray-500 italic">No custom villa spaces added yet. Click 'Add Space' to highlight areas like Pool Deck, Sky Lounge, etc.</p>
            ) : (
              <div className="space-y-3">
                {(form.spaces || []).map((space, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-900/70 p-3 border border-gray-800 rounded-xl">
                    <input
                      type="text"
                      placeholder="Space Title (e.g. Infinity Pool Deck)"
                      value={space.title}
                      onChange={(e) => handleSpaceChange(idx, 'title', e.target.value)}
                      className="w-1/3 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      placeholder="Description (e.g. Heated pool overlooking green cliffside)"
                      value={space.desc}
                      onChange={(e) => handleSpaceChange(idx, 'desc', e.target.value)}
                      className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpace(idx)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Home Truths & House Rules */}
          <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Home Truths (Full Description)</span>
            </h4>
            <textarea
              rows={4}
              value={typeof form.homeTruths === 'string' ? form.homeTruths : (Array.isArray(form.homeTruths) ? form.homeTruths.join('\n') : '')}
              onChange={(e) => setForm({ ...form, homeTruths: e.target.value })}
              className="w-full bg-gray-900/70 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
              placeholder="Enter full description of home truths, villa nuances, location notes..."
            />
          </div>

          <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>House Rules (Full Description)</span>
            </h4>
            <textarea
              rows={4}
              value={typeof form.houseRules === 'string' ? form.houseRules : (Array.isArray(form.houseRules) ? form.houseRules.join('\n') : '')}
              onChange={(e) => setForm({ ...form, houseRules: e.target.value })}
              className="w-full bg-gray-900/70 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
              placeholder="Enter full description of guest rules, quiet hours, smoking/pet policy, pool guidelines..."
            />
          </div>

          {/* Nearby Places & Landmarks */}
          <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Nearby Places & Attractions</span>
              </h4>
              <button
                type="button"
                onClick={handleAddNearby}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Landmark</span>
              </button>
            </div>

            {(form.nearbyPlaces || []).length === 0 ? (
              <p className="text-xs text-gray-500 italic">No nearby landmarks specified. Click 'Add Landmark' to include local attractions.</p>
            ) : (
              <div className="space-y-3">
                {(form.nearbyPlaces || []).map((place, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-900/70 p-3 border border-gray-800 rounded-xl">
                    <input
                      type="text"
                      placeholder="Landmark Name (e.g. Alibaug Beach)"
                      value={place.name}
                      onChange={(e) => handleNearbyChange(idx, 'name', e.target.value)}
                      className="w-1/3 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      placeholder="Distance (e.g. 1.2 km)"
                      value={place.distance}
                      onChange={(e) => handleNearbyChange(idx, 'distance', e.target.value)}
                      className="w-1/4 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <select
                      value={place.type || 'cafe'}
                      onChange={(e) => handleNearbyChange(idx, 'type', e.target.value)}
                      className="w-1/4 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="cafe">Cafe / Dining</option>
                      <option value="beach">Beach / Coast</option>
                      <option value="nature">Nature / Trek</option>
                      <option value="transit">Airport / Station</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveNearby(idx)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Select Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-900/30 border border-gray-850 rounded-2xl">
              {STANDARD_AMENITIES.map((amenity) => {
                const checked = form.amenities.includes(amenity);
                return (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        let updatedAmenities = [...form.amenities];
                        if (e.target.checked) {
                          updatedAmenities.push(amenity);
                        } else {
                          updatedAmenities = updatedAmenities.filter((a) => a !== amenity);
                        }
                        setForm({ ...form, amenities: updatedAmenities });
                      }}
                      className="rounded bg-gray-900 border-gray-800 text-brand-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 shrink-0">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingPropertyId ? 'Save Changes' : 'Add Property Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
