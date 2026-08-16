import React, { useState, useEffect } from 'react';
import { adminAPI, uploadAPI, getFullUploadUrl } from '../services/api';
import {
  Check,
  X,
  Home,
  MapPin,
  User,
  Users,
  BedDouble,
  Bath,
  Loader2,
  Plus,
  Edit,
  UploadCloud,
  Trash2,
  FileText,
  Star
} from 'lucide-react';


const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING_APPROVAL');
  const [error, setError] = useState(null);

  // States for property creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editingPropertyId, setEditingPropertyId] = useState(null);

  const initialFormState = {
    providerId: '',
    title: '',
    description: '',
    pricePerNight: '',
    guestsMax: 2,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'VILLA',
    address: '',
    cityId: '',
    city: '',
    state: '',
    country: 'India',
    googleMapsUrl: '',
    images: '',
    tagline: '',
    collectionId: '',
    amenities: [],
    mealsDescription: '',
    mealsPdf: ''
  };

  const [form, setForm] = useState(initialFormState);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handleOpenEditModal = (p) => {
    setEditingPropertyId(p._id);
    setForm({
      providerId: p.providerId?._id || p.providerId || '',
      title: p.title || '',
      description: p.description || '',
      pricePerNight: p.pricePerNight || '',
      guestsMax: p.guestsMax || 2,
      bedrooms: p.bedrooms || 1,
      bathrooms: p.bathrooms || 1,
      propertyType: p.propertyType || 'VILLA',
      address: p.address || '',
      cityId: p.cityId?._id || p.cityId || '',
      city: '',
      state: '',
      country: 'India',
      googleMapsUrl: p.googleMapsUrl || '',
      images: p.images ? p.images.join(', ') : '',
      tagline: p.tagline || '',
      collectionId: p.collectionId?._id || p.collectionId || '',
      amenities: p.amenities || [],
      mealsDescription: p.mealsDescription || '',
      mealsPdf: p.mealsPdf || ''
    });
    setIsCreateModalOpen(true);
  };


  useEffect(() => {
    fetchProperties();
    fetchFormMetadata();
  }, []);

  const fetchFormMetadata = async () => {
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

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const res = await uploadAPI.uploadPropertyImages(files, editingPropertyId);
      
      const uploadedUrls = res.data.imageUrls || [];
      
      // Get current list of images
      const currentList = form.images
        .split(',')
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      const newList = [...currentList, ...uploadedUrls];
      
      setForm((prev) => ({ ...prev, images: newList.join(', ') }));
    } catch (err) {
      alert(err.message || 'Failed to upload images.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentList = form.images
      .split(',')
      .map((img) => img.trim())
      .filter((img) => img.length > 0);

    const newList = currentList.filter((_, idx) => idx !== indexToRemove);
    setForm((prev) => ({ ...prev, images: newList.join(', ') }));
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPdf(true);
      const res = await uploadAPI.uploadMealPdf(file, editingPropertyId);
      
      const pdfUrl = res.data.pdfUrl || '';
      setForm((prev) => ({ ...prev, mealsPdf: pdfUrl }));
    } catch (err) {
      alert(err.message || 'Failed to upload PDF.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setForm((prev) => ({ ...prev, mealsPdf: '' }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      // Parse images list from comma separated string
      const imagesList = form.images
        .split(',')
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      if (imagesList.length === 0) {
        alert('Please enter at least one photo image URL.');
        setSubmitting(false);
        return;
      }

      const propertyData = {
        providerId: form.providerId,
        title: form.title,
        description: form.description || undefined,
        pricePerNight: parseFloat(form.pricePerNight),
        guestsMax: parseInt(form.guestsMax, 10),
        bedrooms: parseInt(form.bedrooms, 10),
        bathrooms: parseInt(form.bathrooms, 10),
        propertyType: form.propertyType,
        address: form.address,
        cityId: form.cityId || undefined,
        city: form.cityId ? undefined : form.city,
        state: form.cityId ? undefined : form.state,
        country: form.cityId ? undefined : form.country,
        coordinates: {
          lat: 15.4967,
          lng: 73.8268
        },
        googleMapsUrl: form.googleMapsUrl,
        images: imagesList,
        tagline: form.tagline || undefined,
        collectionId: form.collectionId || undefined,
        amenities: form.amenities,
        mealsDescription: form.mealsDescription || undefined,
        mealsPdf: form.mealsPdf || undefined,
        status: 'PUBLISHED' // Automatically published
      };

      if (editingPropertyId) {
        await adminAPI.updateProperty(editingPropertyId, propertyData);
      } else {
        await adminAPI.createProperty(propertyData);
      }
      setIsCreateModalOpen(false);
      setEditingPropertyId(null);
      setForm(initialFormState);
      fetchProperties();
    } catch (err) {
      alert(err.message || 'Failed to create property.');
    } finally {
      setSubmitting(false);
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

  const handleToggleFeatured = async (p) => {
    try {
      setActionLoading(p._id);
      const updatedFeatured = !p.featured;
      await adminAPI.updateProperty(p._id, { featured: updatedFeatured });
      setProperties((prev) =>
        prev.map((item) =>
          item._id === p._id ? { ...item, featured: updatedFeatured } : item
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to update featured status.');
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
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'PENDING_APPROVAL'
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
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'PUBLISHED'
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
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'OTHER'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            <span>Drafts & Suspended</span>
          </button>
        </div>
        <button
          onClick={() => {
            setEditingPropertyId(null);
            setForm(initialFormState);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 py-3 px-6 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl text-sm font-semibold shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Property</span>
        </button>
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
                          handleToggleFeatured(p);
                        }}
                        disabled={actionLoading === p._id}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-md duration-300 ${
                          p.featured
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
                        <span className="font-semibold text-white">{p.providerId?.userId?.name || 'Independent Partner'}</span>
                      </div>
                    </div>
                    <span className="text-white font-bold text-sm">₹{p.pricePerNight?.toLocaleString('en-IN')}<span className="text-[10px] text-gray-500 font-normal">/night</span></span>
                  </div>
                </div>

                {/* Approvals Action Bar */}
                <div className="flex items-center gap-3 border-t border-gray-850 pt-4 mt-1">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gray-800 hover:bg-brand-500/10 hover:text-brand-400 text-gray-300 border border-transparent rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
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
      {/* --- PROPERTY ADD MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-white">{editingPropertyId ? 'Edit Property Listing' : 'Add New Property Listing'}</h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingPropertyId(null);
                }}
                className="text-gray-500 hover:text-white transition-all cursor-pointer text-sm font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            onClick={() => handleRemoveImage(idx)}
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
                          onChange={handleImageUpload}
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
                          onClick={handleRemovePdf}
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
                              onChange={handlePdfUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Select Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-900/30 border border-gray-850 rounded-2xl">
                  {['Wi-Fi', 'Pool', 'Air Conditioning', 'Kitchen', 'Free Parking', 'TV', 'Caretaker', 'Jacuzzi'].map((amenity) => {
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
      )}
    </div>
  );
};

export default Properties;
