import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import {
  Handshake,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Home,
  Filter,
  ExternalLink,
  Trash2,
  Eye,
  Building,
  Sparkles,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { Modal, Select, message, Popconfirm, Tag, Pagination } from "antd";

const PartnerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    contacted: 0,
    approved: 0,
    rejected: 0,
  });

  // Detail Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const filterTabs = [
    { id: "ALL", label: "All Partner Enquiries", count: counts.all },
    { id: "PENDING", label: "Pending Review", count: counts.pending },
    { id: "CONTACTED", label: "Contacted", count: counts.contacted },
    { id: "APPROVED", label: "Approved / Onboarded", count: counts.approved },
    { id: "REJECTED", label: "Declined", count: counts.rejected },
  ];

  useEffect(() => {
    fetchEnquiries();
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const res = await adminAPI.getPartnerEnquiries(params);
      setEnquiries(res.data?.enquiries || []);
      if (res.data?.pagination) {
        setTotalCount(res.data.pagination.total || 0);
      } else {
        setTotalCount(res.data?.enquiries?.length || 0);
      }
      if (res.data?.counts) {
        setCounts(res.data.counts);
      }
    } catch (err) {
      console.error("Error fetching partner enquiries:", err);
      setError("Could not retrieve partner enquiries.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await adminAPI.updatePartnerEnquiryStatus(id, newStatus);
      message.success(`Status updated to ${newStatus}`);
      fetchEnquiries();
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      message.error(err.message || "Failed to update partner enquiry status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(id);
      await adminAPI.deletePartnerEnquiry(id);
      message.success("Partner enquiry deleted successfully.");
      fetchEnquiries();
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error("Failed to delete partner enquiry:", err);
      message.error(err.message || "Failed to delete partner enquiry.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case "CONTACTED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Contacted</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Declined</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
            <span>{status || "PENDING"}</span>
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Handshake className="w-7 h-7 text-brand-600" />
            <span>Partner & Host Enquiries</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage luxury villa listing requests, estate operator leads, and
            partnership applications.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEnquiries}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setStatusFilter("ALL");
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-xs cursor-pointer transition-all hover:border-brand-300 ${
            statusFilter === "ALL" ? "ring-2 ring-brand-500 border-brand-500 bg-brand-50/20" : "border-slate-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Inquiries
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {counts.all || 0}
            </h3>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
            <Handshake className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("PENDING");
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-xs cursor-pointer transition-all hover:border-amber-300 ${
            statusFilter === "PENDING" ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50/20" : "border-slate-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending Review
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {counts.pending || 0}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("CONTACTED");
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-xs cursor-pointer transition-all hover:border-blue-300 ${
            statusFilter === "CONTACTED" ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/20" : "border-slate-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Contacted Leads
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {counts.contacted || 0}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Phone className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("APPROVED");
            setCurrentPage(1);
          }}
          className={`bg-white border rounded-2xl p-5 flex items-center justify-between shadow-xs cursor-pointer transition-all hover:border-emerald-300 ${
            statusFilter === "APPROVED" ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20" : "border-slate-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Approved / Onboarded
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {counts.approved || 0}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, location, property..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1" />
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium">
            Loading partner inquiries...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Failed to Load Inquiries
          </h3>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchEnquiries}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No partner inquiries found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search term or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Host / Applicant</th>
                  <th className="py-4 px-6">Property Location & Type</th>
                  <th className="py-4 px-6">Rooms</th>
                  <th className="py-4 px-6">Referral Source</th>
                  <th className="py-4 px-6">Submitted Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enquiries.map((enq) => {
                  const fullName =
                    `${enq.firstName || ""} ${enq.lastName || ""}`.trim() ||
                    "Partner Applicant";
                  const fullPhone = `${enq.countryCode || "+91"} ${
                    enq.phone || ""
                  }`.trim();

                  return (
                    <tr
                      key={enq._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Host / Applicant */}
                      <td className="py-4 px-6">
                        <div className="text-slate-900 font-bold text-sm">
                          {fullName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a
                            href={`mailto:${enq.email}`}
                            className="hover:text-brand-600 hover:underline"
                          >
                            {enq.email}
                          </a>
                        </div>
                        {enq.phone && (
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a
                              href={`tel:${enq.phone}`}
                              className="hover:text-brand-600 hover:underline"
                            >
                              {fullPhone}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Property Location & Type */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-2.5">
                          <Building className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-slate-900 font-semibold text-sm">
                              {enq.location || "Location Not Specified"}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                              {enq.propertyType || "Villa / Estate"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rooms */}
                      <td className="py-4 px-6 text-xs text-slate-700">
                        <span className="font-semibold">
                          {enq.roomsCount || "N/A"}
                        </span>
                      </td>

                      {/* Referral Source */}
                      <td className="py-4 px-6 text-xs">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          {enq.source || "Direct"}
                        </span>
                      </td>

                      {/* Submitted Date & Time */}
                      <td className="py-4 px-6 text-xs text-slate-600">
                        <div className="flex items-start gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-900 block">{formatDate(enq.createdAt)}</span>
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatTime(enq.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6">
                        <Select
                          value={enq.status || "PENDING"}
                          onChange={(val) => handleStatusChange(enq._id, val)}
                          disabled={actionLoading === enq._id}
                          className="w-36 custom-select-sm"
                          options={[
                            { value: "PENDING", label: "Pending Review" },
                            { value: "CONTACTED", label: "Contacted" },
                            { value: "APPROVED", label: "Approved" },
                            { value: "REJECTED", label: "Declined" },
                          ]}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEnquiry(enq)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                            title="View Full Application"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Popconfirm
                            title="Delete Partner Inquiry"
                            description="Are you sure you want to delete this partner enquiry record?"
                            onConfirm={() => handleDelete(enq._id)}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <button
                              type="button"
                              disabled={actionLoading === enq._id}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                              title="Delete Enquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalCount > 0 && (
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <span className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
                <span className="font-bold text-slate-800">{Math.ceil(totalCount / pageSize) || 1}</span> (Total {totalCount} inquiries)
              </span>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                showSizeChanger
                pageSizeOptions={["10", "20", "50", "100"]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} partner inquiries`}
                size="small"
              />
            </div>
          )}
        </div>
      )}

      {/* View Detail Modal */}
      <Modal
        open={!!selectedEnquiry}
        onCancel={() => setSelectedEnquiry(null)}
        footer={null}
        centered
        width={650}
      >
        <div className="p-4 space-y-6 text-left font-sans">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedEnquiry?.firstName} {selectedEnquiry?.lastName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Submitted on {formatDate(selectedEnquiry?.createdAt)} at {formatTime(selectedEnquiry?.createdAt)} •{" "}
                  {selectedEnquiry?.source}
                </p>
              </div>
            </div>

            <div>{getStatusBadge(selectedEnquiry?.status)}</div>
          </div>

          {/* Contact Details & Property Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                Partner Contact Info
              </span>
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-900">
                    {selectedEnquiry?.firstName} {selectedEnquiry?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`mailto:${selectedEnquiry?.email}`}
                    className="text-brand-600 hover:underline font-medium"
                  >
                    {selectedEnquiry?.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`tel:${selectedEnquiry?.phone}`}
                    className="text-slate-900 font-semibold hover:text-brand-600"
                  >
                    {selectedEnquiry?.countryCode} {selectedEnquiry?.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Property Specifications */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                Estate / Villa Details
              </span>
              <div className="space-y-2 text-slate-700">
                <div>
                  <span className="text-slate-500">Location:</span>{" "}
                  <strong className="text-slate-900">
                    {selectedEnquiry?.location}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Property Type:</span>{" "}
                  <strong className="text-slate-900">
                    {selectedEnquiry?.propertyType}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Rooms Count:</span>{" "}
                  <strong className="text-slate-900">
                    {selectedEnquiry?.roomsCount || "Not specified"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Website / Social Link */}
          {selectedEnquiry?.websiteLink && (
            <div className="bg-brand-50/50 border border-brand-200/60 rounded-2xl p-4 text-xs">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                Website / Listing Link
              </span>
              <a
                href={
                  selectedEnquiry.websiteLink.startsWith("http")
                    ? selectedEnquiry.websiteLink
                    : `https://${selectedEnquiry.websiteLink}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline font-semibold flex items-center gap-1.5 break-all"
              >
                <span>{selectedEnquiry.websiteLink}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}

          {/* Description / Special Notes */}
          {selectedEnquiry?.description && (
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                <span>Partner Notes & Property Bio</span>
              </span>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.description}
              </div>
            </div>
          )}

          {/* Update Status Bar & Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Update Lead Status:
              </span>
              <Select
                value={selectedEnquiry?.status || "PENDING"}
                onChange={(val) => handleStatusChange(selectedEnquiry._id, val)}
                className="w-44"
                options={[
                  { value: "PENDING", label: "Pending Review" },
                  { value: "CONTACTED", label: "Contacted" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "REJECTED", label: "Declined" },
                ]}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={`tel:${selectedEnquiry?.phone}`}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Host</span>
              </a>
              <a
                href={`mailto:${selectedEnquiry?.email}?subject=Roamigo Partnership Inquiry - ${selectedEnquiry?.location}`}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnerEnquiries;
