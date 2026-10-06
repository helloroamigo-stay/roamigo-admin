import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminAPI, uploadAPI, getFullUploadUrl } from "../services/api";
import {
  Loader2,
  Search,
  X,
  LayoutGrid,
  Table as TableIcon,
  Calendar,
  Eye,
  Edit,
  Check,
  Star,
  MapPin,
  Home,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Pagination, Table, Select } from "antd";
import { PropertyTabs } from "../components/properties/PropertyTabs";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PropertyFormModal } from "../components/properties/PropertyFormModal";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("PUBLISHED");
  const [error, setError] = useState(null);

  // Search, Filters, Pagination & View Mode States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedHost, setSelectedHost] = useState("ALL");
  const [selectedUploadSource, setSelectedUploadSource] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input to avoid glitchy re-renders and request flooding
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    published: 0,
    pendingApproval: 0,
    other: 0,
  });
  const [viewMode, setViewMode] = useState("grid");

  // States for property creation/edit
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editingPropertyId, setEditingPropertyId] = useState(null);

  // States for Calendar & Date Management Modal
  const [calendarProperty, setCalendarProperty] = useState(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const initialFormState = {
    providerId: "",
    title: "",
    description: "",
    pricePerNight: "",
    baseGuests: 2,
    guestsMax: 2,
    kidsCount: 0,
    extraAdultFee: 0,
    extraChildFee: 0,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "VILLA",
    address: "",
    cityId: "",
    city: "",
    state: "",
    country: "India",
    googleMapsUrl: "",
    images: "",
    tagline: "",
    collectionId: "",
    amenities: [],
    mealsDescription: "",
    mealsImage: "",
    mealsPdf: "",
    spaces: [],
    homeTruths: [],
    nearbyPlaces: [],
  };

  const [form, setForm] = useState(initialFormState);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Prepare dynamic options for Host dropdown
  const hostOptions = useMemo(() => {
    const hostMap = new Map();

    (providers || []).forEach((pr) => {
      const id = pr._id || pr.userId?._id;
      if (!id) return;
      const name =
        pr.businessName ||
        pr.userId?.name ||
        pr.name ||
        pr.userId?.email ||
        "Host";
      const email = pr.userId?.email || pr.email || "";
      hostMap.set(String(id), {
        value: String(id),
        label: email ? `${name} (${email})` : name,
      });
    });

    return [
      { value: "ALL", label: "All Hosts" },
      ...Array.from(hostMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      ),
    ];
  }, [providers]);

  // Prepare dynamic options for City dropdown
  const cityOptions = useMemo(() => {
    const cityMap = new Map();

    (cities || []).forEach((c) => {
      const id = c._id || c.name;
      if (!id) return;
      cityMap.set(String(id), {
        value: String(id),
        label: c.name,
      });
    });

    return [
      { value: "ALL", label: "All Cities" },
      ...Array.from(cityMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      ),
    ];
  }, [cities]);

  const isFiltered =
    Boolean(searchTerm.trim()) ||
    selectedHost !== "ALL" ||
    selectedUploadSource !== "ALL" ||
    selectedCity !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedHost("ALL");
    setSelectedUploadSource("ALL");
    setSelectedCity("ALL");
    setCurrentPage(1);
  };

  const handleOpenEditModal = (p) => {
    setEditingPropertyId(p._id);
    setForm({
      providerId: p.providerId?._id || p.providerId || "",
      title: p.title || "",
      description: p.description || "",
      pricePerNight: p.pricePerNight || "",
      baseGuests: p.baseGuests !== undefined ? p.baseGuests : 2,
      guestsMax: p.guestsMax || 2,
      kidsCount: p.kidsCount !== undefined ? p.kidsCount : 0,
      extraAdultFee: p.extraAdultFee !== undefined ? p.extraAdultFee : 0,
      extraChildFee: p.extraChildFee !== undefined ? p.extraChildFee : 0,
      bedrooms: p.bedrooms || 1,
      bathrooms: p.bathrooms || 1,
      propertyType: p.propertyType || "VILLA",
      address: p.address || "",
      cityId: p.cityId?._id || p.cityId || "",
      city: "",
      state: "",
      country: "India",
      googleMapsUrl: p.googleMapsUrl || "",
      images: p.images ? p.images.join(", ") : "",
      tagline: p.tagline || "",
      collectionId: p.collectionId?._id || p.collectionId || "",
      collections:
        Array.isArray(p.collections) && p.collections.length > 0
          ? p.collections.map((c) => (typeof c === "object" ? c._id : c))
          : p.collectionId
            ? [
              typeof p.collectionId === "object"
                ? p.collectionId._id
                : p.collectionId,
            ]
            : [],
      amenities: p.amenities || [],
      mealsDescription: p.mealsDescription || "",
      mealsImage: p.mealsImage || "",
      mealsPdf: p.mealsPdf || "",
      spaces: p.spaces && p.spaces.length > 0 ? p.spaces : [],
      homeTruths: p.homeTruths && p.homeTruths.length > 0 ? p.homeTruths : [],
      nearbyPlaces:
        p.nearbyPlaces && p.nearbyPlaces.length > 0 ? p.nearbyPlaces : [],
    });
    setIsCreateModalOpen(true);
  };

  const fetchFormMetadata = async () => {
    try {
      const [providersRes, citiesRes, collectionsRes] = await Promise.all([
        adminAPI.getProviders(),
        adminAPI.getCities(),
        adminAPI.getCollections(),
      ]);
      setProviders(providersRes.data?.providers || []);
      setCities(citiesRes.data?.cities || []);
      setCollections(collectionsRes.data?.collections || []);
    } catch (err) {
      console.error("Error fetching form metadata:", err);
    }
  };

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getProperties({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm.trim() || undefined,
        status: activeTab !== "ALL" ? activeTab : undefined,
        hostId: selectedHost !== "ALL" ? selectedHost : undefined,
        uploadSource: selectedUploadSource !== "ALL" ? selectedUploadSource : undefined,
        cityId: selectedCity !== "ALL" ? selectedCity : undefined,
      });
      setProperties(res.data?.properties || []);
      setTotalCount(res.data?.pagination?.total || 0);
      if (res.data?.counts) {
        setCounts(res.data.counts);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Could not retrieve property listings database records.");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    activeTab,
    selectedHost,
    selectedUploadSource,
    selectedCity,
  ]);

  useEffect(() => {
    fetchFormMetadata();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const res = await uploadAPI.uploadPropertyImages(
        files,
        editingPropertyId
      );
      const uploadedUrls = res.data.imageUrls || [];
      const currentList = form.images
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img.length > 0);
      const newList = [...currentList, ...uploadedUrls];
      setForm((prev) => ({ ...prev, images: newList.join(", ") }));
    } catch (err) {
      alert(err.message || "Failed to upload images.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentList = form.images
      .split(",")
      .map((img) => img.trim())
      .filter((img) => img.length > 0);
    const newList = currentList.filter((_, idx) => idx !== indexToRemove);
    setForm((prev) => ({ ...prev, images: newList.join(", ") }));
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPdf(true);
      const res = await uploadAPI.uploadMealPdf(file, editingPropertyId);
      const filePath =
        res.data?.url ||
        res.data?.pdfUrl ||
        res.data?.imageUrl ||
        res.pdfUrl ||
        res.url ||
        "";
      const isImage = file.type.startsWith("image/");
      setForm((prev) => ({
        ...prev,
        mealsPdf: filePath,
        mealsImage: isImage ? filePath : prev.mealsImage,
      }));
    } catch (err) {
      alert(err.message || "Failed to upload meal menu file.");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setForm((prev) => ({ ...prev, mealsPdf: "", mealsImage: "" }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const imagesList = form.images
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      if (imagesList.length === 0) {
        alert("Please enter at least one photo image URL.");
        setSubmitting(false);
        return;
      }

      const validNearby = (form.nearbyPlaces || []).filter(
        (p) => p.name && p.name.trim() !== ""
      );
      const validSpaces = (form.spaces || []).filter(
        (s) => s.title && s.title.trim() !== ""
      );
      const validHomeTruths =
        typeof form.homeTruths === "string"
          ? form.homeTruths
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
          : Array.isArray(form.homeTruths)
            ? form.homeTruths.filter((t) => t && t.trim() !== "")
            : [];

      const propertyData = {
        providerId: form.providerId || undefined,
        title: form.title,
        description: form.description || undefined,
        pricePerNight: parseFloat(form.pricePerNight),
        baseGuests: parseInt(form.baseGuests || 2, 10),
        guestsMax: parseInt(form.guestsMax, 10),
        kidsCount: parseInt(form.kidsCount || 0, 10),
        extraAdultFee: parseFloat(form.extraAdultFee || 0),
        extraChildFee: parseFloat(form.extraChildFee || 0),
        bedrooms: parseInt(form.bedrooms, 10),
        bathrooms: parseInt(form.bathrooms, 10),
        rooms: ["ROOMS", "ROOM", "HOTEL", "APARTMENT"].includes(
          form.propertyType?.toUpperCase()
        )
          ? Number(form.rooms || 1)
          : undefined,
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
        collections:
          form.collections && form.collections.length > 0
            ? form.collections
            : undefined,
        collectionId:
          form.collections && form.collections.length > 0
            ? form.collections[0]
            : form.collectionId || undefined,
        amenities: form.amenities,
        mealsDescription: form.mealsDescription || undefined,
        mealsImage: form.mealsImage || undefined,
        mealsPdf: form.mealsPdf || undefined,
        spaces: validSpaces.length > 0 ? validSpaces : undefined,
        homeTruths: validHomeTruths.length > 0 ? validHomeTruths : undefined,
        nearbyPlaces: validNearby.length > 0 ? validNearby : undefined,
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
      alert(
        err.message ||
        (editingPropertyId
          ? "Failed to update property."
          : "Failed to create property.")
      );
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
      alert(err.message || "Listing approval failed.");
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
      alert(err.message || "Failed to update featured status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await adminAPI.updatePropertyStatus(id, newStatus);
      setProperties((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-800/50";
      case "PENDING_APPROVAL":
        return "bg-brand-950/40 text-brand-400 border-brand-800/50";
      case "REJECTED":
        return "bg-red-950/40 text-red-400 border-red-800/50";
      case "SUSPENDED":
        return "bg-amber-950/40 text-amber-400 border-amber-800/50";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const tableColumns = [
    {
      title: "Property",
      dataIndex: "title",
      key: "title",
      render: (_, p) => (
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            {p.images?.[0] ? (
              <img
                src={getFullUploadUrl(p.images[0])}
                alt={p.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Home className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm hover:text-brand-600 transition-colors line-clamp-1">
                {p.title}
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono shrink-0">
                {p.propertyType || "VILLA"}
              </span>
            </div>
            {p.tagline && (
              <p className="text-xs text-slate-500 line-clamp-1 italic mt-0.5">
                "{p.tagline}"
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_, p) => (
        <div className="text-xs text-slate-700 space-y-0.5">
          <div className="flex items-center gap-1 font-medium text-slate-900">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>{p.cityId?.name || p.city || "Unknown City"}</span>
          </div>
          <div className="text-slate-500 line-clamp-1">{p.address}</div>
        </div>
      ),
    },
    {
      title: "Host Provider",
      key: "provider",
      render: (_, p) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-900">
            {p.providerId?.name ||
              p.providerId?.userId?.name ||
              "Independent Host"}
          </div>
          {(p.providerId?.email || p.providerId?.userId?.email) && (
            <div className="text-slate-400 text-[11px]">
              {p.providerId?.email || p.providerId?.userId?.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Price & Specs",
      key: "priceSpecs",
      render: (_, p) => (
        <div className="text-xs space-y-1">
          <div className="font-bold text-slate-900">
            ₹{p.pricePerNight?.toLocaleString("en-IN")}{" "}
            <span className="text-[10px] text-slate-500 font-normal">
              /night
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">
            {p.guestsMax || 2} guests · {p.bedrooms || 1} bed ·{" "}
            {p.bathrooms || 1} bath
          </div>
        </div>
      ),
    },
    {
      title: "Featured",
      key: "featured",
      align: "center",
      render: (_, p) => (
        <button
          type="button"
          onClick={() => handleToggleFeatured(p)}
          disabled={actionLoading === p._id}
          className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${p.featured
              ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600"
              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300"
            }`}
          title={
            p.featured
              ? "Featured listing (Click to remove)"
              : "Mark as featured"
          }
        >
          {actionLoading === p._id ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Star
              className={`w-3.5 h-3.5 ${p.featured ? "fill-white text-white" : ""
                }`}
            />
          )}
        </button>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, p) => (
        <Select
          value={p.status}
          disabled={actionLoading === p._id}
          onChange={(newStatus) => handleStatusChange(p._id, newStatus)}
          className="w-36"
          options={[
            { value: "PUBLISHED", label: "Published" },
            { value: "PENDING_APPROVAL", label: "Pending Review" },
            { value: "REJECTED", label: "Rejected" },
            { value: "SUSPENDED", label: "Suspended" },
            { value: "DRAFT", label: "Draft" },
          ]}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/properties/${p._id}/calendar`}
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            title="Manage calendar & availability"
          >
            <Calendar className="w-3.5 h-3.5" />
          </Link>

          <Link
            to={`/properties/review/${p._id}`}
            className="p-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            title="Review details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          <Link
            to={`/properties/edit/${p._id}`}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            title="Edit property"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>

          {p.status === "PENDING_APPROVAL" && (
            <button
              onClick={() => handleApprove(p._id)}
              disabled={actionLoading !== null}
              className="flex items-center gap-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-xs"
              title="Approve property"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      <PropertyTabs
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        propertiesCount={{
          all: counts.all,
          pending: counts.pendingApproval,
          published: counts.published,
        }}
        onOpenCreateModal={() => {
          setEditingPropertyId(null);
          setForm(initialFormState);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Search & Filter Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search properties by title, city, type, host..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status indicator & View Switcher */}
          <div className="flex items-center justify-between lg:justify-end gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {properties.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              </span>{" "}
              -{" "}
              <span className="font-bold text-slate-900">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">{totalCount}</span>{" "}
              properties
            </div>

            <div className="flex items-center bg-slate-100 p-1 border border-slate-200 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "grid"
                    ? "bg-white text-brand-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "table"
                    ? "bg-white text-brand-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
                title="Antd Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            <span>Filters:</span>
          </div>

          {/* Upload Type Filter */}
          <div className="min-w-[170px] flex-1 sm:flex-initial">
            <Select
              value={selectedUploadSource}
              onChange={(val) => {
                setSelectedUploadSource(val);
                setCurrentPage(1);
              }}
              className="w-full sm:w-44"
              options={[
                { value: "ALL", label: "All Upload Types" },
                { value: "HOST", label: "Host Uploaded" },
                { value: "ADMIN", label: "Admin Uploaded" },
              ]}
              popupMatchSelectWidth={false}
            />
          </div>

          {/* Host Filter */}
          <div className="min-w-[200px] flex-1 sm:flex-initial">
            <Select
              showSearch
              optionFilterProp="label"
              value={selectedHost}
              onChange={(val) => {
                setSelectedHost(val);
                setCurrentPage(1);
              }}
              className="w-full sm:w-56"
              placeholder="Filter by Host"
              options={hostOptions}
              popupMatchSelectWidth={false}
            />
          </div>

          {/* City Filter */}
          <div className="min-w-[170px] flex-1 sm:flex-initial">
            <Select
              showSearch
              optionFilterProp="label"
              value={selectedCity}
              onChange={(val) => {
                setSelectedCity(val);
                setCurrentPage(1);
              }}
              className="w-full sm:w-44"
              placeholder="Filter by City"
              options={cityOptions}
              popupMatchSelectWidth={false}
            />
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-300 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-white border border-slate-200 rounded-3xl">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs font-semibold text-slate-600">Loading properties...</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-3xl bg-white space-y-3">
          <p>No property listings found matching your search or filter.</p>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-brand-50 text-brand-600 border border-brand-200 rounded-xl text-xs font-semibold hover:bg-brand-100 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                actionLoading={actionLoading}
                setActionLoading={setActionLoading}
                onOpenEditModal={handleOpenEditModal}
                onOpenCalendarModal={(prop) => {
                  setCalendarProperty(prop);
                  setIsCalendarModalOpen(true);
                }}
                onApprove={handleApprove}
                onToggleFeatured={handleToggleFeatured}
                onStatusChange={handleStatusChange}
                getStatusStyle={getStatusStyle}
              />
            ))}
          </div>

          {/* Antd Pagination Component */}
          {totalCount > 0 && (
            <div className="flex justify-center md:justify-end bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                onChange={(page, newPageSize) => {
                  setCurrentPage(page);
                  setPageSize(newPageSize);
                }}
                showSizeChanger
                pageSizeOptions={["6", "10", "12", "20", "50"]}
                showTotal={(total, range) =>
                  `Showing ${range[0]}-${range[1]} of ${total} properties`
                }
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-2">
          <Table
            dataSource={properties}
            columns={tableColumns}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              onChange: (page, pSize) => {
                setCurrentPage(page);
                setPageSize(pSize);
              },
              showSizeChanger: true,
              pageSizeOptions: ["6", "10", "12", "20", "50"],
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} properties`,
            }}
          />
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
