import React from 'react';
import { Select } from 'antd';
import {
  UploadCloud,
  Loader2,
  Trash2,
  FileText,
  X,
  Plus,
  Compass,
  Home,
  Info,
  ChevronLeft,
  ChevronRight
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
      spaces: [...(prev.spaces || []), { title: '', desc: '', image: '' }]
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

  const imageList = Array.isArray(form.images)
    ? form.images.filter(Boolean)
    : typeof form.images === 'string'
    ? form.images.split(',').map((img) => img.trim()).filter(Boolean)
    : [];

  const handleMoveImage = (idx, direction) => {
    const list = [...imageList];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setForm((prev) => ({
      ...prev,
      images: Array.isArray(prev.images) ? list : list.join(', ')
    }));
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

            <div className="md:col-span-2">
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Featured Collections (Select Multiple)</label>
              <Select
                mode="multiple"
                allowClear
                placeholder="Select feature collections..."
                value={
                  Array.isArray(form.collections) && form.collections.length > 0
                    ? form.collections
                    : (form.collectionId ? [form.collectionId] : [])
                }
                onChange={(selectedValues) => {
                  setForm({
                    ...form,
                    collections: selectedValues,
                    collectionId: selectedValues.length > 0 ? selectedValues[0] : ''
                  });
                }}
                className="w-full text-sm"
                style={{ width: '100%' }}
                options={collections.map((col) => ({
                  label: col.title,
                  value: col._id || col.id
                }))}
              />
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
                <option value="ROOMS">Rooms</option>
                <option value="VILLA">Villa</option>
                <option value="RESORT">Resort</option>
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
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {["ROOMS", "ROOM", "HOTEL", "APARTMENT"].includes(form.propertyType?.toUpperCase()) && (
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Inventory *</label>
                <input
                  type="number"
                  required
                  value={form.rooms || 1}
                  onChange={(e) => setForm({ ...form, rooms: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  min="1"
                />
              </div>
            )}
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
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Extra Adult Fee (₹)</label>
              <input
                type="number"
                value={form.extraAdultFee || 0}
                onChange={(e) => setForm({ ...form, extraAdultFee: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                min="0"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Extra Kid Fee (₹)</label>
              <input
                type="number"
                value={form.extraChildFee || 0}
                onChange={(e) => setForm({ ...form, extraChildFee: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                min="0"
                placeholder="0"
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
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wide">
                  Property Photos ({imageList.length}) *
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Click or drag &amp; drop to upload multiple photos. The 1st photo is used as the cover photo!
                </p>
              </div>
              {imageList.length > 0 && (
                <span className="text-[11px] text-gray-400 font-medium">
                  {imageList.length} photo{imageList.length > 1 ? 's' : ''} uploaded
                </span>
              )}
            </div>

            {/* Single Clean Multiple Image Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  onImageUpload({ target: { files: e.dataTransfer.files } });
                }
              }}
              className="relative border-2 border-dashed border-gray-750 hover:border-brand-500/70 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-900/30 hover:bg-gray-900/50 transition-all cursor-pointer group"
            >
              {uploadingImages ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
                  <span className="text-xs font-semibold text-brand-400">Uploading photos to cloud storage...</span>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer w-full text-center">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-brand-300 transition-colors">
                      Click to upload or drag &amp; drop photos here
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Select multiple images (PNG, JPG, JPEG, WEBP - Max 10MB each)
                    </p>
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

            {/* Uploaded Photo Gallery Grid with Reorder and Delete */}
            {imageList.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Photo Sequence ({imageList.length} images)</span>
                  <span>Use arrows to reorder photo sequence</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1 bg-gray-900/20 rounded-2xl border border-gray-800">
                  {imageList.map((img, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-2 flex flex-col justify-between space-y-2 group hover:border-brand-500/40 transition-all relative"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-950">
                        <img
                          src={getFullUploadUrl(img)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400'
                            : 'bg-black/70 text-white backdrop-blur-xs'
                        }`}>
                          {idx === 0 ? '★ Cover' : `#${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-red-950/90 border border-red-900/60 text-red-400 p-1 rounded-md hover:bg-red-900 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-sm"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-800/60">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, -1)}
                            className={`p-1 rounded text-xs transition-all ${
                              idx === 0
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer'
                            }`}
                            title="Move left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === imageList.length - 1}
                            onClick={() => handleMoveImage(idx, 1)}
                            className={`p-1 rounded text-xs transition-all ${
                              idx === imageList.length - 1
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer'
                            }`}
                            title="Move right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {idx === 0 ? 'Cover' : `#${idx + 1}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

              {/* Meal Menu File (Image or PDF) Upload */}
              <div className="space-y-2">
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Property Meal Menu (Image or PDF)</label>

                {form.mealsPdf || form.mealsImage ? (
                  <div className="flex items-center justify-between p-3.5 bg-gray-900 border border-gray-800 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-brand-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-medium text-white truncate block">Meal Menu File</span>
                        <a
                          href={getFullUploadUrl(form.mealsPdf || form.mealsImage)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-brand-400 hover:underline truncate block"
                        >
                          View Menu File
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onRemovePdf}
                      className="p-1.5 bg-gray-800 hover:bg-red-950/40 hover:text-red-400 text-gray-400 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-900/30"
                      title="Remove Menu File"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed border-gray-800 hover:border-brand-500/50 rounded-xl p-5 flex flex-col items-center justify-center bg-gray-900/20 transition-all min-h-[90px]">
                    {uploadingPdf ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                        <span className="text-[11px] text-gray-400">Uploading meal file...</span>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-1.5 cursor-pointer w-full text-center">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <span className="text-xs font-semibold text-brand-400 hover:text-brand-300">Upload Meal Menu (Image or PDF)</span>
                          <p className="text-[9px] text-gray-500 mt-0.5">Supports images (JPG, PNG, WEBP) or PDF menu files</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*,application/pdf,.pdf"
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
                  <div key={idx} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-gray-900/70 p-3 border border-gray-800 rounded-xl">
                    <input
                      type="text"
                      placeholder="Space Title (e.g. Infinity Pool Deck)"
                      value={space.title}
                      onChange={(e) => handleSpaceChange(idx, 'title', e.target.value)}
                      className="w-full md:w-1/3 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Description (e.g. Heated pool overlooking cliffside)"
                      value={space.desc}
                      onChange={(e) => handleSpaceChange(idx, 'desc', e.target.value)}
                      className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      placeholder="Image URL (Optional)"
                      value={space.image || ''}
                      onChange={(e) => handleSpaceChange(idx, 'image', e.target.value)}
                      className="w-full md:w-1/4 bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpace(idx)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg transition-all self-end md:self-center cursor-pointer"
                      title="Remove Space"
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

          <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Cancellation Policy & Terms</span>
            </h4>
            <textarea
              rows={5}
              value={form.cancellationPolicy || ''}
              onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
              className="w-full bg-gray-900/70 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 leading-relaxed"
              placeholder="Full refund for cancellations made 14 or more days before check-in. 50% refund for cancellations made 7–13 days before check-in. Cancellations made less than 7 days before check-in are non-refundable.&#10;&#10;Checkin 2pm&#10;Checkout 11am&#10;Early check-in and late check-out is subject to availability (at an additional fee) or can change if they want"
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
