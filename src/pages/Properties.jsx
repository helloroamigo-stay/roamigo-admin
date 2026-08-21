import React, { useState, useEffect } from 'react';
import { adminAPI, uploadAPI } from '../services/api';
import { Loader2 } from 'lucide-react';
import { PropertyTabs } from '../components/properties/PropertyTabs';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyFormModal } from '../components/properties/PropertyFormModal';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING_APPROVAL');
  const [error, setError] = useState(null);

  // States for property creation/edit
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
    mealsImage: '',
    mealsPdf: '',
    spaces: [],
    homeTruths: [],
    nearbyPlaces: []
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
    collections: Array.isArray(p.collections) && p.collections.length > 0
      ? p.collections.map(c => typeof c === 'object' ? c._id : c)
      : (p.collectionId ? [typeof p.collectionId === 'object' ? p.collectionId._id : p.collectionId] : []),
      amenities: p.amenities || [],
      mealsDescription: p.mealsDescription || '',
      mealsImage: p.mealsImage || '',
      mealsPdf: p.mealsPdf || '',
      spaces: p.spaces && p.spaces.length > 0 ? p.spaces : [],
      homeTruths: p.homeTruths && p.homeTruths.length > 0 ? p.homeTruths : [],
      nearbyPlaces: p.nearbyPlaces && p.nearbyPlaces.length > 0 ? p.nearbyPlaces : []
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
      const filePath = res.data?.url || res.data?.pdfUrl || res.data?.imageUrl || res.pdfUrl || res.url || '';
      const isImage = file.type.startsWith('image/');
      setForm((prev) => ({
        ...prev,
        mealsPdf: filePath,
        mealsImage: isImage ? filePath : prev.mealsImage
      }));
    } catch (err) {
      alert(err.message || 'Failed to upload meal menu file.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setForm((prev) => ({ ...prev, mealsPdf: '', mealsImage: '' }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const imagesList = form.images
        .split(',')
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      if (imagesList.length === 0) {
        alert('Please enter at least one photo image URL.');
        setSubmitting(false);
        return;
      }

      const validNearby = (form.nearbyPlaces || []).filter(p => p.name && p.name.trim() !== '');
      const validSpaces = (form.spaces || []).filter(s => s.title && s.title.trim() !== '');
      const validHomeTruths = typeof form.homeTruths === 'string'
        ? form.homeTruths.split('\n').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(form.homeTruths) ? form.homeTruths.filter(t => t && t.trim() !== '') : []);

      const propertyData = {
        providerId: form.providerId || undefined,
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
        coordinates: { lat: 15.4967, lng: 73.8268 },
        googleMapsUrl: form.googleMapsUrl,
        images: imagesList,
        tagline: form.tagline || undefined,
        collections: form.collections && form.collections.length > 0 ? form.collections : undefined,
        collectionId: form.collections && form.collections.length > 0 ? form.collections[0] : (form.collectionId || undefined),
        amenities: form.amenities,
        mealsDescription: form.mealsDescription || undefined,
        mealsImage: form.mealsImage || undefined,
        mealsPdf: form.mealsPdf || undefined,
        spaces: validSpaces.length > 0 ? validSpaces : undefined,
        homeTruths: validHomeTruths.length > 0 ? validHomeTruths : undefined,
        nearbyPlaces: validNearby.length > 0 ? validNearby : undefined
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
      alert(err.message || (editingPropertyId ? 'Failed to update property.' : 'Failed to create property.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await adminAPI.updatePropertyStatus(id, newStatus);
      setProperties((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (activeTab === 'PENDING_APPROVAL') {
      return p.status === 'PENDING_APPROVAL';
    } else if (activeTab === 'PUBLISHED') {
      return p.status === 'PUBLISHED';
    } else {
      return ['DRAFT', 'REJECTED', 'SUSPENDED', 'ARCHIVED'].includes(p.status);
    }
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50';
      case 'PENDING_APPROVAL':
        return 'bg-brand-950/40 text-brand-400 border-brand-800/50';
      case 'REJECTED':
        return 'bg-red-950/40 text-red-400 border-red-800/50';
      case 'SUSPENDED':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/50';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Fetching real-time property catalog...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      <PropertyTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        propertiesCount={{
          pending: properties.filter(p => p.status === 'PENDING_APPROVAL').length,
          published: properties.filter(p => p.status === 'PUBLISHED').length
        }}
        onOpenCreateModal={() => {
          setEditingPropertyId(null);
          setForm(initialFormState);
          setIsCreateModalOpen(true);
        }}
      />

      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-300 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {filteredProperties.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-sm border border-dashed border-gray-800 rounded-3xl">
          No property listings found matching this status.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProperties.map((p) => (
            <PropertyCard
              key={p._id}
              property={p}
              actionLoading={actionLoading}
              setActionLoading={setActionLoading}
              onOpenEditModal={handleOpenEditModal}
              onApprove={handleApprove}
              onToggleFeatured={handleToggleFeatured}
              onStatusChange={handleStatusChange}
              getStatusStyle={getStatusStyle}
            />
          ))}
        </div>
      )}

      <PropertyFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPropertyId(null);
        }}
        editingPropertyId={editingPropertyId}
        form={form}
        setForm={setForm}
        providers={providers}
        cities={cities}
        collections={collections}
        submitting={submitting}
        uploadingImages={uploadingImages}
        uploadingPdf={uploadingPdf}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        onPdfUpload={handlePdfUpload}
        onRemovePdf={handleRemovePdf}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
};

export default Properties;
