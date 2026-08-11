import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import * as Lucide from 'lucide-react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Compass, 
  Check, 
  Globe, 
  Sparkles, 
  Loader2,
  FolderOpen,
  Image as ImageIcon
} from 'lucide-react';

const Destinations = () => {
  const [activeTab, setActiveTab] = useState('cities');
  const [cities, setCities] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Modal control states
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [colModalOpen, setColModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [cityForm, setCityForm] = useState({
    name: '',
    state: '',
    country: 'India',
    tagline: '',
    image: '',
    icon: 'MapPin',
    featured: false
  });

  const [colForm, setColForm] = useState({
    title: '',
    subtitle: '',
    badge: '',
    image: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [citiesRes, collectionsRes] = await Promise.all([
        adminAPI.getCities(),
        adminAPI.getCollections()
      ]);
      setCities(citiesRes.data?.cities || []);
      setCollections(collectionsRes.data?.collections || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Could not fetch destinations or collections data.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to dynamically render Lucide icons
  const renderCityIcon = (iconName) => {
    const IconComponent = Lucide[iconName] || Lucide.MapPin;
    return <IconComponent className="w-5 h-5" />;
  };

  // Preset icons available to select
  const presetIcons = [
    'MapPin', 'Palmtree', 'Mountain', 'Waves', 'Compass', 'Castle', 
    'Trees', 'Flame', 'Sun', 'Cloud', 'Tent', 'Ship'
  ];

  // City handlers
  const handleOpenCityModal = (city = null) => {
    if (city) {
      setEditingItem(city);
      setCityForm({
        name: city.name,
        state: city.state,
        country: city.country || 'India',
        tagline: city.tagline || '',
        image: city.image || '',
        icon: city.icon || 'MapPin',
        featured: city.featured || false
      });
    } else {
      setEditingItem(null);
      setCityForm({
        name: '',
        state: '',
        country: 'India',
        tagline: '',
        image: '',
        icon: 'MapPin',
        featured: false
      });
    }
    setCityModalOpen(true);
  };

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingItem) {
        // Edit City
        await adminAPI.updateCity(editingItem._id, cityForm);
      } else {
        // Create City
        await adminAPI.createCity(cityForm);
      }
      setCityModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error saving city details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCityDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination? Properties linked to this city might need update.')) {
      return;
    }
    try {
      setLoading(true);
      await adminAPI.deleteCity(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete city.');
      setLoading(false);
    }
  };

  // Collection handlers
  const handleOpenColModal = (col = null) => {
    if (col) {
      setEditingItem(col);
      setColForm({
        title: col.title,
        subtitle: col.subtitle || '',
        badge: col.badge || '',
        image: col.image || ''
      });
    } else {
      setEditingItem(null);
      setColForm({
        title: '',
        subtitle: '',
        badge: '',
        image: ''
      });
    }
    setColModalOpen(true);
  };

  const handleColSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingItem) {
        // Edit Collection
        await adminAPI.updateCollection(editingItem._id, colForm);
      } else {
        // Create Collection
        await adminAPI.createCollection(colForm);
      }
      setColModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error saving collection details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleColDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection category?')) {
      return;
    }
    try {
      setLoading(true);
      await adminAPI.deleteCollection(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete collection.');
      setLoading(false);
    }
  };

  if (loading && cities.length === 0 && collections.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading destinations and collections...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Tabs and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
        {/* Toggle tabs */}
        <div className="flex bg-gray-900/80 p-1 border border-gray-850 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('cities')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'cities'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Cities & Destinations</span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'collections'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Property Collections</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => activeTab === 'cities' ? handleOpenCityModal() : handleOpenColModal()}
          className="flex items-center gap-2 py-3 px-6 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl text-sm font-semibold shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add {activeTab === 'cities' ? 'Destination' : 'Collection'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-300 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Render Cities tab */}
      {activeTab === 'cities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div 
              key={city._id} 
              className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden group flex flex-col justify-between"
            >
              {/* Photo Area */}
              <div className="relative h-44 w-full bg-gray-900">
                {city.image ? (
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-650 bg-gray-850">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    {/* Icon tag */}
                    <div className="p-2 bg-gray-950/80 backdrop-blur-md rounded-xl text-brand-400 border border-gray-800">
                      {renderCityIcon(city.icon)}
                    </div>
                    {/* Featured label */}
                    {city.featured && (
                      <span className="text-[10px] px-2.5 py-1 bg-brand-500 text-white rounded-full font-bold uppercase tracking-wider shadow-md">
                        Featured
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{city.name}</h3>
                    <p className="text-xs text-gray-300 mt-0.5">{city.state}, {city.country}</p>
                  </div>
                </div>
              </div>

              {/* Text Tagline & Actions */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <p className="text-xs text-gray-400 italic font-medium leading-relaxed">
                  "{city.tagline || 'No tagline specified'}"
                </p>

                <div className="flex items-center justify-between border-t border-gray-850 pt-4">
                  <span className="text-[10px] font-mono text-gray-500">slug: {city.slug}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenCityModal(city)}
                      className="p-2 bg-gray-850 hover:bg-brand-500/10 text-gray-400 hover:text-brand-400 rounded-lg border border-transparent hover:border-brand-500/20 transition-all cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCityDelete(city._id)}
                      className="p-2 bg-gray-850 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Collections tab */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((col) => (
            <div 
              key={col._id} 
              className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden group flex flex-col justify-between"
            >
              {/* Photo Area */}
              <div className="relative h-44 w-full bg-gray-900">
                {col.image ? (
                  <img 
                    src={col.image} 
                    alt={col.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-650 bg-gray-850">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent p-4 flex flex-col justify-between">
                  <div className="flex justify-end">
                    {col.badge && (
                      <span className="text-[10px] px-2.5 py-1 bg-[#1e293b]/90 border border-gray-800 text-white rounded-full font-bold uppercase tracking-wider">
                        {col.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{col.title}</h3>
                    <span className="text-[10px] font-mono text-gray-400">slug: {col.slug}</span>
                  </div>
                </div>
              </div>

              {/* Description & Actions */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  {col.subtitle || 'No subtitle specified'}
                </p>

                <div className="flex items-center justify-end border-t border-gray-850 pt-4 gap-2">
                  <button
                    onClick={() => handleOpenColModal(col)}
                    className="p-2 bg-gray-850 hover:bg-brand-500/10 text-gray-400 hover:text-brand-400 rounded-lg border border-transparent hover:border-brand-500/20 transition-all cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleColDelete(col._id)}
                    className="p-2 bg-gray-850 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CITIES ADD/EDIT MODAL --- */}
      {cityModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Destination' : 'Add New Destination'}
              </h3>
              <button 
                onClick={() => setCityModalOpen(false)}
                className="text-gray-500 hover:text-white transition-all cursor-pointer text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleCitySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">City Name</label>
                  <input
                    type="text"
                    required
                    value={cityForm.name}
                    onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                    placeholder="e.g. Lonavala"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">State</label>
                  <input
                    type="text"
                    required
                    value={cityForm.state}
                    onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Country</label>
                  <input
                    type="text"
                    required
                    value={cityForm.country}
                    onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Featured</label>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cityForm.featured}
                      onChange={(e) => setCityForm({ ...cityForm, featured: e.target.checked })}
                      className="rounded bg-gray-900 border-gray-800 text-brand-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-gray-300">Feature on homepage</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Tagline</label>
                <input
                  type="text"
                  value={cityForm.tagline}
                  onChange={(e) => setCityForm({ ...cityForm, tagline: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Scenic Valley & Riverfront Retreats"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Photo Image URL</label>
                <input
                  type="url"
                  value={cityForm.image}
                  onChange={(e) => setCityForm({ ...cityForm, image: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Icon select area */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Select Icon</label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-900/50 border border-gray-800 rounded-xl">
                  {presetIcons.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setCityForm({ ...cityForm, icon: ico })}
                      className={`p-2.5 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        cityForm.icon === ico
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-gray-850 hover:bg-gray-800 border-gray-800 text-gray-400'
                      }`}
                    >
                      {renderCityIcon(ico)}
                      <span className="text-[9px] mt-1 font-mono tracking-tighter truncate max-w-full">{ico}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? 'Save Destination' : 'Add Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COLLECTIONS ADD/EDIT MODAL --- */}
      {colModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Collection' : 'Add New Collection'}
              </h3>
              <button 
                onClick={() => setColModalOpen(false)}
                className="text-gray-500 hover:text-white transition-all cursor-pointer text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleColSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Collection Title</label>
                <input
                  type="text"
                  required
                  value={colForm.title}
                  onChange={(e) => setColForm({ ...colForm, title: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Beachfront Estates"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Badge Tag</label>
                <input
                  type="text"
                  value={colForm.badge}
                  onChange={(e) => setColForm({ ...colForm, badge: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Signature Collection"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Subtitle / Summary</label>
                <textarea
                  value={colForm.subtitle}
                  onChange={(e) => setColForm({ ...colForm, subtitle: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Wake up to private ocean horizons and golden sands..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Category Cover Photo URL</label>
                <input
                  type="url"
                  value={colForm.image}
                  onChange={(e) => setColForm({ ...colForm, image: e.target.value })}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? 'Save Collection' : 'Add Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Destinations;
