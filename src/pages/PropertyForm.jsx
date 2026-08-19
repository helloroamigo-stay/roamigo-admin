import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, uploadAPI, getFullUploadUrl } from '../services/api';
import { Upload, Select, Input, InputNumber, Checkbox, Tabs, Button as AntdButton, message } from 'antd';
import {
  ArrowLeft,
  UploadCloud,
  Loader2,
  Trash2,
  FileText,
  Plus,
  Home,
  MapPin,
  Sparkles,
  Info,
  Compass,
  ArrowLeftRight,
  ArrowLeftIcon,
  ArrowRightIcon,
  Check,
  Star,
  Eye,
  Building,
  GripVertical,
  Move
} from 'lucide-react';

const { TextArea } = Input;

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

const PropertyForm = () => {
  const { id } = useParams(); // If present, edit mode
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Metadata dropdown options
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [collections, setCollections] = useState([]);

  // Form State
  const [form, setForm] = useState({
    providerId: '',
    title: '',
    description: '',
    pricePerNight: '',
    baseGuests: 2,
    guestsMax: 2,
    kidsCount: 0,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'VILLA',
    address: '',
    cityId: '',
    city: '',
    state: '',
    country: 'India',
    googleMapsUrl: '',
    images: [], // Array of string URLs/paths
    tagline: '',
    collectionId: '',
    amenities: [],
    mealsDescription: '',
    cuisines: '',
    dietaryNotes: '',
    mealsImage: '',
    mealsPdf: '',
    spaces: [],
    homeTruths: [],
    nearbyPlaces: [],
    cancellationPolicy: ''
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);

  // HTML5 Drag & Drop Image Reordering Handlers
  const handleDragStart = (e, index) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropImage = (targetIndex) => {
    if (draggedImageIndex === null || draggedImageIndex === targetIndex) return;
    setForm(prev => {
      const updated = [...prev.images];
      const [draggedItem] = updated.splice(draggedImageIndex, 1);
      updated.splice(targetIndex, 0, draggedItem);
      return { ...prev, images: updated };
    });
    setDraggedImageIndex(null);
  };

  useEffect(() => {
    fetchMetadata();
    if (isEditMode) {
      fetchPropertyDetail();
    }
  }, [id]);

  const fetchMetadata = async () => {
    try {
      const [providersRes, citiesRes, collectionsRes] = await Promise.all([
        adminAPI.getProviders(),
        adminAPI.getCities(),
        adminAPI.getCollections()
      ]);
      setProviders(providersRes.data?.providers || []);
      setCities(citiesRes.data?.cities || []);
      setCollections(collectionsRes.data?.collections || []);
    } catch (err) {
      console.error('Error fetching form metadata:', err);
    }
  };

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getPropertyById(id);
      const p = res.data?.property;
      if (!p) throw new Error('Property not found');

      setForm({
        providerId: p.providerId?._id || p.providerId || '',
        title: p.title || '',
        description: p.description || '',
        pricePerNight: p.pricePerNight || '',
        baseGuests: p.baseGuests !== undefined ? p.baseGuests : 2,
        guestsMax: p.guestsMax || 2,
        kidsCount: p.kidsCount !== undefined ? p.kidsCount : 0,
        bedrooms: p.bedrooms || 1,
        bathrooms: p.bathrooms || 1,
        propertyType: p.propertyType || 'VILLA',
        address: p.address || '',
        cityId: p.cityId?._id || p.cityId || '',
        city: p.city || '',
        state: p.state || '',
        country: p.country || 'India',
        googleMapsUrl: p.googleMapsUrl || '',
        images: p.images || [],
        tagline: p.tagline || '',
        collectionId: p.collectionId?._id || p.collectionId || '',
        amenities: p.amenities || [],
        mealsDescription: p.mealsDescription || '',
        cuisines: p.cuisines ? (Array.isArray(p.cuisines) ? p.cuisines.join(', ') : p.cuisines) : '',
        dietaryNotes: p.dietaryNotes || '',
        mealsImage: p.mealsImage || '',
        mealsPdf: p.mealsPdf || '',
        spaces: p.spaces && p.spaces.length > 0 ? p.spaces : [],
        homeTruths: p.homeTruths && p.homeTruths.length > 0 ? p.homeTruths : [],
        nearbyPlaces: p.nearbyPlaces && p.nearbyPlaces.length > 0 ? p.nearbyPlaces : [],
        cancellationPolicy: p.cancellationPolicy || ''
      });
    } catch (err) {
      console.error('Error fetching property for edit:', err);
      setError(err.message || 'Could not load property details.');
    } finally {
      setLoading(false);
    }
  };

  // Ant Design Multiple Image Upload Handler via beforeUpload
  const handleBeforeUpload = async (file, fileList) => {
    // Only trigger batch upload once per selection batch
    if (file !== fileList[0]) return false;

    try {
      setUploadingImages(true);
      const res = await uploadAPI.uploadPropertyImages(fileList);
      // Backend returns res = { success: true, data: { imageUrls: [...] } }
      const uploadedPaths = res.data?.imageUrls || res.data?.images || res.imageUrls || res.images || [];

      if (uploadedPaths.length > 0) {
        setForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedPaths]
        }));
        message.success(`Successfully uploaded ${uploadedPaths.length} image(s)!`);
      } else {
        message.error('Upload completed, but no image paths returned.');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      message.error(err.message || 'Image upload failed.');
    } finally {
      setUploadingImages(false);
    }

    return false; // Stop Ant Design default XHR upload
  };

  // Move Image Left / Right Reorder Handlers
  const handleMoveImageLeft = (index) => {
    if (index === 0) return;
    setForm(prev => {
      const updated = [...prev.images];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return { ...prev, images: updated };
    });
  };

  const handleMoveImageRight = (index) => {
    if (index === form.images.length - 1) return;
    setForm(prev => {
      const updated = [...prev.images];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return { ...prev, images: updated };
    });
  };

  const handleRemoveImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // PDF Menu Upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPdf(true);
      const res = await uploadAPI.uploadMealPdf(file);
      const pdfPath = res.data?.pdfUrl || res.data?.pdf || res.pdfUrl || res.url || '';
      setForm(prev => ({ ...prev, mealsPdf: pdfPath }));
      message.success('Meal menu PDF uploaded successfully!');
    } catch (err) {
      message.error(err.message || 'PDF upload failed.');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Dynamic Array Handlers (Spaces, Home Truths, Nearby)
  const handleAddSpace = () => {
    setForm(prev => ({
      ...prev,
      spaces: [...(prev.spaces || []), { title: '', desc: '' }]
    }));
  };

  const handleRemoveSpace = (index) => {
    setForm(prev => ({
      ...prev,
      spaces: (prev.spaces || []).filter((_, i) => i !== index)
    }));
  };

  const handleSpaceChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...(prev.spaces || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, spaces: updated };
    });
  };

  const handleAddHomeTruth = () => {
    setForm(prev => ({
      ...prev,
      homeTruths: [...(prev.homeTruths || []), '']
    }));
  };

  const handleRemoveHomeTruth = (index) => {
    setForm(prev => ({
      ...prev,
      homeTruths: (prev.homeTruths || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddNearby = () => {
    setForm(prev => ({
      ...prev,
      nearbyPlaces: [...(prev.nearbyPlaces || []), { name: '', distance: '', type: 'cafe' }]
    }));
  };

  const handleRemoveNearby = (index) => {
    setForm(prev => ({
      ...prev,
      nearbyPlaces: (prev.nearbyPlaces || []).filter((_, i) => i !== index)
    }));
  };

  const handleNearbyChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...(prev.nearbyPlaces || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, nearbyPlaces: updated };
    });
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.pricePerNight) {
      message.error('Please fill in required fields (Title, Price).');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...form,
        pricePerNight: Number(form.pricePerNight),
        guestsMax: Number(form.guestsMax),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        images: form.images,
        cuisines: typeof form.cuisines === 'string'
          ? form.cuisines.split(',').map(s => s.trim()).filter(Boolean)
          : (form.cuisines || []),
        dietaryNotes: form.dietaryNotes || '',
        cancellationPolicy: form.cancellationPolicy || ''
      };

      if (isEditMode) {
        await adminAPI.updateProperty(id, payload);
        message.success('Property listing updated successfully!');
      } else {
        await adminAPI.createProperty(payload);
        message.success('New property listing created!');
      }

      navigate('/properties');
    } catch (err) {
      console.error('Submit error:', err);
      message.error(err.message || 'Failed to save property listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading property editor workspace...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1500px] mx-auto space-y-8 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            to="/properties"
            className="p-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              {isEditMode ? `Edit Property: ${form.title || 'Listing'}` : 'Add New Luxury Property Listing'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure complete villa specifications, pricing, gallery photos, and guest experiences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/properties"
            className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isEditMode ? 'Save & Update Listing' : 'Publish Property'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Form Content divided into Structured Tabs */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs
          defaultActiveKey="basic"
          type="card"
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs"
          items={[
            {
              key: 'basic',
              label: (
                <span className="flex items-center gap-2 font-bold text-xs py-1">
                  <Home className="w-4 h-4 text-brand-600" />
                  <span>1. Overview & Pricing</span>
                </span>
              ),
              children: (
                <div className="space-y-6 p-4">
                  {/* Provider & Collection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                        Owner / Provider Host *
                      </label>
                      <select
                        value={form.providerId}
                        onChange={(e) => setForm({ ...form, providerId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="">Select Provider Host</option>
                        {providers.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.businessName || p.userId?.name || 'Unknown'} ({p.userId?.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                        Collection Category
                      </label>
                      <select
                        value={form.collectionId}
                        onChange={(e) => setForm({ ...form, collectionId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 cursor-pointer"
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

                  {/* Title & Type */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                        Property Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                        placeholder="e.g. Whispering Pines Beachfront Villa"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                        Property Type *
                      </label>
                      <select
                        required
                        value={form.propertyType}
                        onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 cursor-pointer"
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

                  {/* Tagline & Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={form.tagline}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                        placeholder="e.g. Wake up to private ocean horizons and infinity pools"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                        Price Per Night (₹ INR) *
                      </label>
                      <input
                        type="number"
                        required
                        value={form.pricePerNight}
                        onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                        placeholder="25000"
                      />
                    </div>
                  </div>

                  {/* Specs: Capacity */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">Base Guests</label>
                      <input
                        type="number"
                        min={1}
                        value={form.baseGuests}
                        onChange={(e) => setForm({ ...form, baseGuests: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">Max Guests</label>
                      <input
                        type="number"
                        min={1}
                        value={form.guestsMax}
                        onChange={(e) => setForm({ ...form, guestsMax: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">Max Kids</label>
                      <input
                        type="number"
                        min={0}
                        value={form.kidsCount}
                        onChange={(e) => setForm({ ...form, kidsCount: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">Bedrooms</label>
                      <input
                        type="number"
                        min={1}
                        value={form.bedrooms}
                        onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">Bathrooms</label>
                      <input
                        type="number"
                        min={1}
                        value={form.bathrooms}
                        onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                      Full Description
                    </label>
                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                      placeholder="Enter detailed villa story, architecture, highlights, and guest experience..."
                    />
                  </div>
                </div>
              )
            },
            {
              key: 'gallery',
              label: (
                <span className="flex items-center gap-2 font-bold text-xs py-1">
                  <UploadCloud className="w-4 h-4 text-brand-600" />
                  <span>2. Gallery & Media ({form.images.length})</span>
                </span>
              ),
              children: (
                <div className="space-y-8 p-4">
                  {/* Ant Design Multiple Upload Component */}
                  <div>
                    <label className="block text-slate-900 text-sm font-bold mb-2">
                      Upload Property Photos (Multiple File Selection & Drag Drop)
                    </label>
                    <p className="text-xs text-slate-500 mb-4">
                      Select up to 60 images at once. Use the <strong className="text-slate-800">Move Left (←)</strong> and <strong className="text-slate-800">Move Right (→)</strong> buttons to reorder your photos. The 1st photo is used as the cover photo!
                    </p>

                    <Upload.Dragger
                      multiple
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={handleBeforeUpload}
                      className="bg-slate-50 border-2 border-dashed border-brand-300 hover:border-brand-500 rounded-3xl p-8 text-center transition-all cursor-pointer"
                    >
                      <div className="flex flex-col items-center">
                        <UploadCloud className="w-12 h-12 text-brand-600 mb-3" />
                        <p className="text-slate-900 font-bold text-base">Click or drag images here to upload</p>
                        <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP formats up to 60 photos</p>
                        {uploadingImages && (
                          <div className="flex items-center gap-2 mt-4 text-brand-600 font-semibold text-xs">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading photos to cloud storage...</span>
                          </div>
                        )}
                      </div>
                    </Upload.Dragger>
                  </div>

                  {/* Interactive Re-orderable Image Gallery Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Property Photo Sequence ({form.images.length} images)</span>
                          <Move className="w-4 h-4 text-brand-600" />
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Drag and drop photo cards directly to reorder sequence, or use the move buttons.
                        </p>
                      </div>
                    </div>

                    {form.images.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                        No photos uploaded yet. Click above to upload villa photos.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {form.images.map((img, idx) => (
                          <div
                            key={idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDropImage(idx)}
                            onDragEnd={() => setDraggedImageIndex(null)}
                            className={`bg-slate-50 border rounded-2xl p-3 flex flex-col justify-between space-y-3 group shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative select-none ${draggedImageIndex === idx
                              ? 'opacity-40 border-brand-500 ring-2 ring-brand-400 scale-[0.98]'
                              : 'border-slate-200 hover:border-brand-300'
                              }`}
                          >
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-200">
                              <img
                                src={getFullUploadUrl(img)}
                                alt={`Property ${idx + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              {idx === 0 && (
                                <span className="absolute top-2 left-2 bg-brand-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                                  Cover Photo
                                </span>
                              )}
                              <span className="absolute top-2 right-2 p-1 bg-slate-900/60 text-white rounded-md backdrop-blur-xs flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white font-mono text-[10px] px-2 py-0.5 rounded-md">
                                #{idx + 1}
                              </span>
                            </div>

                            {/* Reorder Left / Right & Delete Controls */}
                            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImageLeft(idx)}
                                  disabled={idx === 0}
                                  className="p-1.5 bg-white hover:bg-brand-50 text-slate-600 hover:text-brand-600 disabled:opacity-30 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                  title="Move Left"
                                >
                                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImageRight(idx)}
                                  disabled={idx === form.images.length - 1}
                                  className="p-1.5 bg-white hover:bg-brand-50 text-slate-600 hover:text-brand-600 disabled:opacity-30 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                  title="Move Right"
                                >
                                  <ArrowRightIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1.5 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            },
            {
              key: 'location',
              label: (
                <span className="flex items-center gap-2 font-bold text-xs py-1">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>3. Location & Address</span>
                </span>
              ),
              children: (
                <div className="space-y-6 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                        City Destination
                      </label>
                      <select
                        value={form.cityId}
                        onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="">Select Destination City</option>
                        {cities.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}, {c.state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                        State
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                        placeholder="e.g. Goa / Maharashtra"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                      Full Address
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                      placeholder="e.g. House No. 42, Vagator Beach Road, North Goa"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                      Google Maps URL Link
                    </label>
                    <input
                      type="url"
                      value={form.googleMapsUrl}
                      onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              )
            },
            {
              key: 'amenities',
              label: (
                <span className="flex items-center gap-2 font-bold text-xs py-1">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>4. Amenities & Meals</span>
                </span>
              ),
              children: (
                <div className="space-y-8 p-4">
                  {/* Amenities List */}
                  <div>
                    <label className="block text-slate-900 text-sm font-bold mb-3">
                      Select Luxury Amenities
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      {STANDARD_AMENITIES.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={(form.amenities || []).includes(item)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setForm(prev => ({
                                ...prev,
                                amenities: checked
                                  ? [...(prev.amenities || []), item]
                                  : (prev.amenities || []).filter(a => a !== item)
                              }));
                            }}
                            className="rounded text-brand-600 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Meals Section */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Dining & Chef Menu Package</h4>

                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">
                        Meals & Culinary Description
                      </label>
                      <textarea
                        rows={3}
                        value={form.mealsDescription}
                        onChange={(e) => setForm({ ...form, mealsDescription: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-900"
                        placeholder="Describe available meal plans, private chef services, breakfast inclusions..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">
                        Available Cuisines (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={form.cuisines}
                        onChange={(e) => setForm({ ...form, cuisines: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium"
                        placeholder="e.g. Traditional Regional Cuisines, Modern Italian & Pastas, Continental Grills"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">
                        Dietary Notes & Concierge Instructions (Modal Details)
                      </label>
                      <textarea
                        rows={2}
                        value={form.dietaryNotes}
                        onChange={(e) => setForm({ ...form, dietaryNotes: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
                        placeholder="e.g. Please enter details such as allergies, special diets (keto, vegan, diabetic) in concierge field during checkout..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-2">
                        Upload Meal Menu PDF Document
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfUpload}
                          className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                        />
                        {uploadingPdf && (
                          <div className="flex items-center gap-2 text-xs text-brand-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading PDF...</span>
                          </div>
                        )}
                        {form.mealsPdf && (
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            <span>PDF Attached</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'rules',
              label: (
                <span className="flex items-center gap-2 font-bold text-xs py-1">
                  <Info className="w-4 h-4 text-brand-600" />
                  <span>5. Layout, Rules & Places</span>
                </span>
              ),
              children: (
                <div className="space-y-8 p-4">
                  {/* Villa Layout Spaces */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Villa Layout & Spaces</h4>
                      <button
                        type="button"
                        onClick={handleAddSpace}
                        className="py-1.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Space</span>
                      </button>
                    </div>

                    {(form.spaces || []).map((space, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                        <input
                          type="text"
                          value={space.title}
                          onChange={(e) => handleSpaceChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Bedroom 1 (Ground Floor)"
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                        />
                        <input
                          type="text"
                          value={space.desc}
                          onChange={(e) => handleSpaceChange(idx, 'desc', e.target.value)}
                          placeholder="e.g. King bed, ensuite bathroom, terrace view"
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 md:col-span-2"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Home Truths */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Home Truths & House Rules</h4>
                      <button
                        type="button"
                        onClick={handleAddHomeTruth}
                        className="py-1.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add House Rule</span>
                      </button>
                    </div>

                    {(form.homeTruths || []).map((truth, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={truth}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm(prev => {
                              const updated = [...prev.homeTruths];
                              updated[idx] = val;
                              return { ...prev, homeTruths: updated };
                            });
                          }}
                          placeholder="e.g. Loud music allowed only until 10 PM outdoors"
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHomeTruth(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Nearby Places */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Nearby Places & Distance</h4>
                      <button
                        type="button"
                        onClick={handleAddNearby}
                        className="py-1.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Nearby Place</span>
                      </button>
                    </div>

                    {(form.nearbyPlaces || []).map((place, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          value={place.name}
                          onChange={(e) => handleNearbyChange(idx, 'name', e.target.value)}
                          placeholder="Place Name (e.g. Vagator Beach)"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                        />
                        <input
                          type="text"
                          value={place.distance}
                          onChange={(e) => handleNearbyChange(idx, 'distance', e.target.value)}
                          placeholder="Distance (e.g. 1.2 km)"
                          className="w-full sm:w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                        />
                        <select
                          value={place.type || 'cafe'}
                          onChange={(e) => handleNearbyChange(idx, 'type', e.target.value)}
                          className="w-full sm:w-44 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-500 cursor-pointer"
                        >
                          <option value="cafe">Cafe</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="beach">Beach</option>
                          <option value="nature">Nature & Parks</option>
                          <option value="airport">Airport & Transit</option>
                          <option value="attraction">Tourist Attraction</option>
                          <option value="temple">Temple & Worship</option>
                          <option value="shopping">Shopping & Market</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveNearby(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-xl transition-colors cursor-pointer self-end sm:self-center"
                          title="Remove Place"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cancellation Policy */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Cancellation Policy</h4>
                    <div>
                      <label className="block text-slate-600 text-xs font-semibold mb-1">
                        Cancellation Policy & Refund Terms
                      </label>
                      <textarea
                        rows={3}
                        value={form.cancellationPolicy}
                        onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium"
                        placeholder="e.g. Full refund up to 7 days before check-in. 50% refund up to 48 hours before check-in. Cancellations made within 48 hours of check-in are non-refundable."
                      />
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Link
            to="/properties"
            className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold border border-slate-200 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-8 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isEditMode ? 'Save & Update Property Listing' : 'Publish Property Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
