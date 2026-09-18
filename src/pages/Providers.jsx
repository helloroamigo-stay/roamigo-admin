import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminAPI, getFullUploadUrl } from "../services/api";
import {
  UserCheck,
  UserMinus,
  UserX,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Award,
  Clock,
  Search,
  Filter,
  Home,
  Calendar,
  Eye,
  X,
  ExternalLink,
  MapPin,
  Users as GuestsIcon,
  BedDouble,
  Bath,
  Sparkles,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  FileText,
  Download,
  FileCheck2,
} from "lucide-react";

export const Providers = () => {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal States: Hosted Properties
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const [selectedProviderForProps, setSelectedProviderForProps] =
    useState(null);
  const [hostProperties, setHostProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Modal States: Host Bookings
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [selectedProviderForBookings, setSelectedProviderForBookings] =
    useState(null);
  const [hostBookings, setHostBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Modal States: Host Verification Documents
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [selectedProviderForDocs, setSelectedProviderForDocs] = useState(null);

  const handleOpenDocsModal = (provider) => {
    setSelectedProviderForDocs(provider);
    setDocsModalOpen(true);
  };

  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes(".pdf");
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getProviders();
      setProviders(res.data?.providers || []);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("Could not fetch registered host providers.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to verify and approve this host operator? They will receive full property publishing access."
      )
    ) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.approveProvider(id);
      fetchProviders();
    } catch (err) {
      alert(err.message || "Verification approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (
      !window.confirm("Are you sure you want to reject this host registration?")
    ) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.rejectProvider(id);
      fetchProviders();
    } catch (err) {
      alert(err.message || "Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to suspend this provider? This will deactivate their listed properties and block login."
      )
    ) {
      return;
    }
    try {
      setActionLoading(id);
      await adminAPI.suspendProvider(id);
      fetchProviders();
    } catch (err) {
      alert(err.message || "Suspension failed.");
    } finally {
      setActionLoading(null);
    }
  };

  // Open Hosted Properties Modal
  const handleOpenPropertiesModal = async (provider) => {
    setSelectedProviderForProps(provider);
    setPropertiesModalOpen(true);
    setHostProperties([]);
    setLoadingProperties(true);
    try {
      const res = await adminAPI.getProviderProperties(provider._id);
      setHostProperties(res.data?.properties || []);
    } catch (err) {
      console.error("Failed to load host properties:", err);
      alert(err.message || "Failed to load properties for this host.");
    } finally {
      setLoadingProperties(false);
    }
  };

  // Open Host Bookings Modal
  const handleOpenBookingsModal = async (provider) => {
    setSelectedProviderForBookings(provider);
    setBookingsModalOpen(true);
    setHostBookings([]);
    setLoadingBookings(true);
    try {
      const res = await adminAPI.getProviderBookings(provider._id);
      setHostBookings(res.data?.bookings || []);
    } catch (err) {
      console.error("Failed to load host bookings:", err);
      alert(err.message || "Failed to load bookings for this host.");
    } finally {
      setLoadingBookings(false);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "₹0";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1 w-fit">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Rejected</span>
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 w-fit">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Suspended</span>
          </span>
        );
      case "REGISTERED":
      case "PENDING_VERIFICATION":
      case "PENDING":
      case "PENDING_APPROVAL":
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const getPropertyStatusBadge = (status) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            Published
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            Pending Approval
          </span>
        );
      case "REJECTED":
        return (
          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
            Rejected
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            Suspended
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
            Draft
          </span>
        );
    }
  };

  const getBookingStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
      case "PAID":
        return (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            Confirmed
          </span>
        );
      case "PENDING":
      case "PENDING_PAYMENT":
      case "PENDING_APPROVAL":
        return (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            Pending
          </span>
        );
      case "CANCELLED":
      case "REJECTED":
        return (
          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
            {status}
          </span>
        );
    }
  };

  // Filtered providers
  const filteredProviders = providers.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const nameMatch = p.userId?.name?.toLowerCase().includes(term);
    const emailMatch = p.userId?.email?.toLowerCase().includes(term);
    const phoneMatch = p.userId?.phone?.toLowerCase().includes(term);
    const bizMatch = p.businessName?.toLowerCase().includes(term);

    const matchesSearch =
      !term || nameMatch || emailMatch || phoneMatch || bizMatch;

    let matchesStatus = true;
    if (statusFilter === "APPROVED") {
      matchesStatus = p.approvalStatus === "APPROVED";
    } else if (statusFilter === "PENDING") {
      matchesStatus = [
        "REGISTERED",
        "PENDING_VERIFICATION",
        "PENDING",
        "PENDING_APPROVAL",
      ].includes(p.approvalStatus);
    } else if (statusFilter === "SUSPENDED") {
      matchesStatus = p.approvalStatus === "SUSPENDED";
    } else if (statusFilter === "REJECTED") {
      matchesStatus = p.approvalStatus === "REJECTED";
    }

    return matchesSearch && matchesStatus;
  });

  const totalCount = providers.length;
  const pendingCount = providers.filter((p) =>
    [
      "REGISTERED",
      "PENDING_VERIFICATION",
      "PENDING",
      "PENDING_APPROVAL",
    ].includes(p.approvalStatus)
  ).length;
  const verifiedCount = providers.filter(
    (p) => p.approvalStatus === "APPROVED"
  ).length;
  const totalPropertiesCount = providers.reduce(
    (sum, p) => sum + (p.propertiesCount || 0),
    0
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building className="w-7 h-7 text-brand-600" />
            <span>Host Partners & Providers</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage verified villa operators, inspect individual listings, track
            hosted bookings, and process approval requests.
          </p>
        </div>
        <button
          onClick={fetchProviders}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              loading ? "animate-spin text-brand-600" : "text-slate-500"
            }`}
          />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Total Hosts
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {totalCount}
          </h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
            Awaiting Verification
          </span>
          <h3 className="text-2xl font-bold text-amber-600 mt-2">
            {pendingCount}
          </h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
            Verified Partners
          </span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">
            {verifiedCount}
          </h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
            Total Listed Villas
          </span>
          <h3 className="text-2xl font-bold text-purple-600 mt-2">
            {totalPropertiesCount}
          </h3>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Host, Business, Email, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-slate-700"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1" />
          {[
            { key: "ALL", label: "All Hosts" },
            { key: "APPROVED", label: "Verified" },
            { key: "PENDING", label: "Awaiting Verification" },
            { key: "SUSPENDED", label: "Suspended" },
            { key: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table Format */}
      {loading && providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium">
            Fetching registered host operators...
          </p>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No host partners found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or verification filter.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Host / Operator</th>
                  <th className="py-4 px-6">Business Profile</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Properties Listed</th>
                  <th className="py-4 px-6 text-center">Bookings</th>
                  <th className="py-4 px-6 text-center">Verification Docs</th>
                  <th className="py-4 px-6 text-right">
                    Verification & Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProviders.map((p) => {
                  const propCount = p.propertiesCount || 0;
                  const bookCount = p.bookingsCount || 0;

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Host / Operator Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          {p.userId?.avatar ? (
                            <img
                              src={getFullUploadUrl(p.userId.avatar)}
                              alt={p.userId.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                              {p.userId?.name?.slice(0, 2).toUpperCase() ||
                                "HP"}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{p.userId?.name || "Unknown Host"}</span>
                              {p.superhost && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                                  <Award className="w-2.5 h-2.5 shrink-0 text-amber-600" />
                                  <span>Superhost</span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {p.userId?.email || "No email"}
                              </span>
                            </div>
                            {p.userId?.phone && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{p.userId.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Business & Bio */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-xs">
                          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            <span className="truncate">
                              {p.businessName || "Independent Host"}
                            </span>
                          </div>
                          {p.bio && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                              "{p.bio}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {getStatusBadge(p.approvalStatus)}
                      </td>

                      {/* Properties Listed + View Button */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleOpenPropertiesModal(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl border border-brand-200 cursor-pointer shadow-2xs transition-all hover:scale-102"
                          title="Click to view all hosted properties"
                        >
                          <Home className="w-3.5 h-3.5 text-brand-600" />
                          <span>
                            {propCount}{" "}
                            {propCount === 1 ? "Property" : "Properties"}
                          </span>
                          <Eye className="w-3 h-3 ml-0.5 text-brand-500" />
                        </button>
                      </td>

                      {/* Bookings + View Button */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleOpenBookingsModal(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl border border-purple-200 cursor-pointer shadow-2xs transition-all hover:scale-102"
                          title="Click to view booking records for this host"
                        >
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <span>
                            {bookCount}{" "}
                            {bookCount === 1 ? "Booking" : "Bookings"}
                          </span>
                          <Eye className="w-3 h-3 ml-0.5 text-purple-500" />
                        </button>
                      </td>

                      {/* Verification Docs */}
                      <td className="py-4 px-6 text-center">
                        {(() => {
                          const aadhar =
                            p.aadharCard || p.documents?.aadharCard;
                          const bill =
                            p.propertyBill || p.documents?.propertyBill;
                          const uploadedCount =
                            (aadhar ? 1 : 0) + (bill ? 1 : 0);

                          return (
                            <button
                              onClick={() => handleOpenDocsModal(p)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-xl border cursor-pointer shadow-2xs transition-all hover:scale-102 ${
                                uploadedCount === 2
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : uploadedCount === 1
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                              }`}
                              title="Click to view host verification documents (Aadhaar & Property Bill)"
                            >
                              <FileText className="w-3.5 h-3.5 text-brand-600" />
                              <span>Docs ({uploadedCount}/2)</span>
                              <Eye className="w-3 h-3 ml-0.5 opacity-70" />
                            </button>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {[
                            "REGISTERED",
                            "PENDING_VERIFICATION",
                            "PENDING",
                            "PENDING_APPROVAL",
                            "REJECTED",
                          ].includes(p.approvalStatus) && (
                            <button
                              onClick={() => handleApprove(p._id)}
                              disabled={actionLoading !== null}
                              className="flex items-center gap-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-2xs transition-all"
                              title="Approve Host Verification"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {[
                            "REGISTERED",
                            "PENDING_VERIFICATION",
                            "PENDING",
                            "PENDING_APPROVAL",
                            "APPROVED",
                          ].includes(p.approvalStatus) && (
                            <button
                              onClick={() => handleReject(p._id)}
                              disabled={actionLoading !== null}
                              className="flex items-center gap-1 py-1.5 px-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                              title="Reject Registration"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          {p.approvalStatus === "APPROVED" && (
                            <button
                              onClick={() => handleSuspend(p._id)}
                              disabled={actionLoading !== null}
                              className="flex items-center gap-1 py-1.5 px-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all"
                              title="Suspend Host Operator"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW HOSTED PROPERTIES (Complete view of hosted properties)      */}
      {/* ========================================================================= */}
      {propertiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
                  <Home className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Hosted Properties</span>
                    <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-0.5 rounded-full">
                      {selectedProviderForProps?.businessName ||
                        selectedProviderForProps?.userId?.name}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Owner:{" "}
                    <span className="font-semibold text-slate-700">
                      {selectedProviderForProps?.userId?.name}
                    </span>{" "}
                    ({selectedProviderForProps?.userId?.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPropertiesModalOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingProperties ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">
                    Fetching hosted properties catalogue...
                  </p>
                </div>
              ) : hostProperties.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                  <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">
                    No properties listed yet
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    This host has not submitted or created any property listings
                    yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hostProperties.map((prop) => {
                    const coverImage = prop.images?.[0]
                      ? getFullUploadUrl(prop.images[0])
                      : "/logo.png";
                    const cityName = prop.cityId?.name || prop.city || "India";

                    return (
                      <div
                        key={prop._id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-brand-300 hover:shadow-xs transition-all space-y-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <img
                            src={coverImage}
                            alt={prop.title}
                            className="w-24 h-24 rounded-xl object-cover border border-slate-100 shrink-0"
                            onError={(e) => {
                              e.target.src = "/logo.png";
                            }}
                          />
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                                {prop.propertyType || "Villa"}
                              </span>
                              {getPropertyStatusBadge(prop.status)}
                            </div>
                            <h4
                              className="font-bold text-slate-900 text-sm truncate"
                              title={prop.title}
                            >
                              {prop.title}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {cityName}, {prop.address}
                              </span>
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                              <span className="font-bold text-slate-900">
                                {formatCurrency(prop.pricePerNight)}{" "}
                                <span className="text-[10px] font-normal text-slate-500">
                                  / night
                                </span>
                              </span>
                              <span className="text-slate-300">•</span>
                              <span>{prop.guestsMax || 2} Guests</span>
                              <span className="text-slate-300">•</span>
                              <span>{prop.bedrooms || 1} BHK</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons for this property */}
                        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                          <Link
                            to={`/properties/review/${prop._id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Full Property Audit</span>
                          </Link>

                          <Link
                            to={`/properties/edit/${prop._id}`}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                            title="Edit Property Info"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>
                Total properties listed:{" "}
                <strong className="text-slate-900">
                  {hostProperties.length}
                </strong>
              </span>
              <button
                onClick={() => setPropertiesModalOpen(false)}
                className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW HOST BOOKINGS (Complete view of bookings for this host)     */}
      {/* ========================================================================= */}
      {bookingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Host Booking Records</span>
                    <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                      {selectedProviderForBookings?.businessName ||
                        selectedProviderForBookings?.userId?.name}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Viewing reservations and stay inquiries for properties owned
                    by this host.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingsModalOpen(false)}
                className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingBookings ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">
                    Fetching host booking logs...
                  </p>
                </div>
              ) : hostBookings.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">
                    No bookings recorded
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    There are no reservation requests or confirmed stays for
                    this host's properties yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-4 bg-purple-50/50 border border-purple-100 p-4 rounded-2xl">
                    <div>
                      <div className="text-[11px] font-bold text-purple-600 uppercase">
                        Total Reservations
                      </div>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">
                        {hostBookings.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-purple-600 uppercase">
                        Total Booking Volume
                      </div>
                      <div className="text-xl font-bold text-emerald-600 mt-0.5">
                        {formatCurrency(
                          hostBookings.reduce(
                            (sum, b) =>
                              sum + (b.totalAmount || b.totalPrice || 0),
                            0
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-purple-600 uppercase">
                        Confirmed Stays
                      </div>
                      <div className="text-xl font-bold text-purple-700 mt-0.5">
                        {
                          hostBookings.filter((b) =>
                            ["CONFIRMED", "COMPLETED", "PAID"].includes(
                              b.status
                            )
                          ).length
                        }
                      </div>
                    </div>
                  </div>

                  {/* Table of bookings */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Ref / Property</th>
                          <th className="py-3 px-4">Guest Details</th>
                          <th className="py-3 px-4">Dates & Guests</th>
                          <th className="py-3 px-4">Total Amount</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {hostBookings.map((b) => {
                          const propTitle = b.propertyId?.title || "Villa Stay";
                          const propImg = b.propertyId?.images?.[0]
                            ? getFullUploadUrl(b.propertyId.images[0])
                            : "/logo.png";

                          return (
                            <tr key={b._id} className="hover:bg-slate-50/80">
                              {/* Reference / Property */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={propImg}
                                    alt={propTitle}
                                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                                    onError={(e) => {
                                      e.target.src = "/logo.png";
                                    }}
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {b.bookingReference ||
                                        b._id.slice(-8).toUpperCase()}
                                    </div>
                                    <div
                                      className="text-[11px] text-slate-500 truncate max-w-[150px]"
                                      title={propTitle}
                                    >
                                      {propTitle}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Guest Details */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-800">
                                    {b.customerId?.name ||
                                      b.guestInfo?.name ||
                                      "Guest"}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {b.customerId?.email || b.guestInfo?.email}
                                  </div>
                                  {(b.customerId?.phone ||
                                    b.guestInfo?.phone) && (
                                    <div className="text-[10px] text-slate-400">
                                      {b.customerId?.phone ||
                                        b.guestInfo?.phone}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Dates & Guests */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-medium text-slate-800">
                                    {formatDate(b.checkIn)} →{" "}
                                    {formatDate(b.checkOut)}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {b.nights || 1} nights •{" "}
                                    {b.guestsCount || b.guests || 2} guests
                                  </div>
                                </div>
                              </td>

                              {/* Amount */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">
                                  {formatCurrency(
                                    b.totalAmount || b.totalPrice || 0
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase">
                                  {b.paymentStatus || "PENDING"}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4 text-right">
                                {getBookingStatusBadge(b.status)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>
                Total Bookings:{" "}
                <strong className="text-slate-900">
                  {hostBookings.length}
                </strong>
              </span>
              <button
                onClick={() => setBookingsModalOpen(false)}
                className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Host Verification Documents (Aadhaar & Property Bill) */}
      {docsModalOpen && selectedProviderForDocs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      Host Verification Documents
                    </h3>
                    {getStatusBadge(selectedProviderForDocs.approvalStatus)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Operator:{" "}
                    <strong className="text-slate-800 font-semibold">
                      {selectedProviderForDocs.userId?.name || "Unknown Host"}
                    </strong>
                    {selectedProviderForDocs.businessName
                      ? ` (${selectedProviderForDocs.businessName})`
                      : ""}{" "}
                    • {selectedProviderForDocs.userId?.email || "No email"}
                    {selectedProviderForDocs.userId?.phone
                      ? ` • ${selectedProviderForDocs.userId.phone}`
                      : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDocsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {(() => {
                const aadhar =
                  selectedProviderForDocs.aadharCard ||
                  selectedProviderForDocs.documents?.aadharCard;
                const bill =
                  selectedProviderForDocs.propertyBill ||
                  selectedProviderForDocs.documents?.propertyBill;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document 1: Aadhaar Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                Aadhaar Card
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Government Identity Proof
                              </p>
                            </div>
                          </div>
                          {aadhar ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Uploaded
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Not Uploaded
                            </span>
                          )}
                        </div>

                        {aadhar ? (
                          <div className="space-y-3">
                            {isPdf(aadhar) ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 shrink-0 font-bold text-[10px]">
                                    PDF
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                      {aadhar.split("/").pop() ||
                                        "Aadhaar Card"}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      PDF Document
                                    </p>
                                  </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                                  <iframe
                                    src={getFullUploadUrl(aadhar)}
                                    className="w-full h-64 border-0"
                                    title="Aadhaar Card PDF Preview"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white max-h-72 flex items-center justify-center shadow-2xs group relative">
                                <img
                                  src={getFullUploadUrl(aadhar)}
                                  alt="Aadhaar Card"
                                  className="w-full h-auto max-h-72 object-contain group-hover:scale-102 transition-transform duration-300"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                              <a
                                href={getFullUploadUrl(aadhar)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 text-center flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Full Document</span>
                              </a>
                              <a
                                href={getFullUploadUrl(aadhar)}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer"
                                title="Download Document"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 space-y-2">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">
                              No Aadhaar Card Uploaded
                            </p>
                            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                              The host operator has not attached their Aadhaar
                              Card to their profile yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document 2: Property Bill */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                Property Bill
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Electricity / Water / Municipal Tax Bill
                              </p>
                            </div>
                          </div>
                          {bill ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Uploaded
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Not Uploaded
                            </span>
                          )}
                        </div>

                        {bill ? (
                          <div className="space-y-3">
                            {isPdf(bill) ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 shrink-0 font-bold text-[10px]">
                                    PDF
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                      {bill.split("/").pop() || "Property Bill"}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      PDF Document
                                    </p>
                                  </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                                  <iframe
                                    src={getFullUploadUrl(bill)}
                                    className="w-full h-64 border-0"
                                    title="Property Bill PDF Preview"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white max-h-72 flex items-center justify-center shadow-2xs group relative">
                                <img
                                  src={getFullUploadUrl(bill)}
                                  alt="Property Bill"
                                  className="w-full h-auto max-h-72 object-contain group-hover:scale-102 transition-transform duration-300"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                              <a
                                href={getFullUploadUrl(bill)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 text-center flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Full Document</span>
                              </a>
                              <a
                                href={getFullUploadUrl(bill)}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer"
                                title="Download Document"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 space-y-2">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">
                              No Property Bill Uploaded
                            </p>
                            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                              The host operator has not attached their Property
                              Bill to their profile yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Documents are stored in persistent uploads storage outside
                ephemeral builds.
              </div>
              <div className="flex items-center gap-2">
                {[
                  "REGISTERED",
                  "PENDING_VERIFICATION",
                  "PENDING",
                  "PENDING_APPROVAL",
                ].includes(selectedProviderForDocs.approvalStatus) && (
                  <button
                    onClick={() => {
                      handleApprove(selectedProviderForDocs._id);
                      setDocsModalOpen(false);
                    }}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve Host</span>
                  </button>
                )}
                <button
                  onClick={() => setDocsModalOpen(false)}
                  className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Providers;
