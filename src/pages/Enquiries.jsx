import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import {
  HelpCircle,
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
  DollarSign,
  Users as GuestsIcon,
  Send,
  MessageSquareQuote,
  TrendingUp,
  PhoneCall,
  UserCheck,
  UserX,
  RefreshCw,
  Tag as TagIcon,
  Eye,
} from "lucide-react";
import { Modal, Select, message, Tag } from "antd";

const LEAD_STATUS_OPTIONS = [
  { value: "New Enquiry", label: "New Enquiry", color: "blue" },
  {
    value: "Called and Shared details",
    label: "Called and Shared details",
    color: "cyan",
  },
  { value: "Follow Up", label: "Follow Up", color: "orange" },
  { value: "Follow Up 2", label: "Follow Up 2", color: "purple" },
  { value: "Low budget", label: "Low budget", color: "indigo" },
  { value: "No Response", label: "No Response", color: "default" },
  { value: "Junk", label: "Junk", color: "error" },
  { value: "Converted", label: "Converted", color: "success" },
  { value: "Not Converted", label: "Not Converted", color: "magenta" },
];

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Confirmation & Email Modal State
  const [selectedEnquiryForConfirm, setSelectedEnquiryForConfirm] =
    useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const filterTabs = [
    { id: "ALL", label: "All Leads" },
    { id: "New Enquiry", label: "New Enquiry" },
    { id: "Called and Shared details", label: "Called & Shared details" },
    { id: "Follow Up", label: "Follow Up" },
    { id: "Follow Up 2", label: "Follow Up 2" },
    { id: "Converted", label: "Converted" },
    { id: "Low budget", label: "Low budget" },
    { id: "No Response", label: "No Response" },
    { id: "Junk", label: "Junk" },
    { id: "Not Converted", label: "Not Converted" },
  ];

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getBookings();
      setEnquiries(res.data?.bookings || []);
    } catch (err) {
      console.error("Error fetching property enquiries:", err);
      setError("Could not retrieve guest enquiries.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeadStatusChange = async (id, newLeadStatus) => {
    try {
      setActionLoading(id);
      await adminAPI.updateBookingLeadStatus(id, newLeadStatus);
      message.success(`Status updated to "${newLeadStatus}"`);
      setEnquiries((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, leadStatus: newLeadStatus } : item
        )
      );
    } catch (err) {
      console.error("Failed to update lead status:", err);
      message.error(err.message || "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenConfirmModal = (enq) => {
    setSelectedEnquiryForConfirm(enq);
    const roomsText =
      enq.rooms && enq.rooms.length > 0
        ? ` (Rooms: ${enq.rooms
            .map((r) => String(r).replace(/^room\s*/i, ""))
            .join(", ")})`
        : "";
    setCustomMessage(
      `We are pleased to share the details and confirm your booking enquiry for ${
        enq.propertyId?.title || "your stay"
      }${roomsText}! Your requested dates are now reserved. Please complete payment within 24 hours to finalize your reservation.`
    );
  };

  const handleSendConfirmation = async () => {
    if (!selectedEnquiryForConfirm) return;
    try {
      setConfirming(true);
      const res = await adminAPI.confirmEnquiry(selectedEnquiryForConfirm._id, {
        message: customMessage.trim(),
      });

      // Also automatically mark lead as Converted if desired
      await adminAPI
        .updateBookingLeadStatus(selectedEnquiryForConfirm._id, "Converted")
        .catch(() => {});

      message.success(
        res.message ||
          "Confirmation sent, calendar dates locked, and lead updated to Converted!"
      );
      setSelectedEnquiryForConfirm(null);
      setCustomMessage("");
      fetchEnquiries();
    } catch (err) {
      console.error("Error sending confirmation:", err);
      message.error(err.message || "Failed to send confirmation.");
    } finally {
      setConfirming(false);
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

  const getLeadStatusBadge = (leadStatus) => {
    const status = leadStatus || "New Enquiry";
    switch (status) {
      case "Converted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Converted</span>
          </span>
        );
      case "Called and Shared details":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <PhoneCall className="w-3 h-3 text-sky-600" />
            <span>Called & Shared</span>
          </span>
        );
      case "Follow Up":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Follow Up</span>
          </span>
        );
      case "Follow Up 2":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" />
            <span>Follow Up 2</span>
          </span>
        );
      case "Low budget":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <DollarSign className="w-3 h-3 text-indigo-600" />
            <span>Low budget</span>
          </span>
        );
      case "No Response":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <UserX className="w-3 h-3 text-slate-500" />
            <span>No Response</span>
          </span>
        );
      case "Junk":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-300 line-through">
            <span>Junk</span>
          </span>
        );
      case "Not Converted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Not Converted</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span>New Enquiry</span>
          </span>
        );
    }
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const code = enq.bookingCode || enq._id || "";
    const guestName = enq.customerId?.name || enq.guestInfo?.name || "";
    const guestEmail = enq.customerId?.email || enq.guestInfo?.email || "";
    const guestPhone = enq.customerId?.phone || enq.guestInfo?.phone || "";
    const propTitle = enq.propertyId?.title || "";
    const leadStatus = enq.leadStatus || "New Enquiry";

    const matchesSearch =
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leadStatus.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || leadStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = enquiries.length;
  const inPipelineCount = enquiries.filter((e) =>
    ["Called and Shared details", "Follow Up", "Follow Up 2"].includes(
      e.leadStatus
    )
  ).length;
  const convertedCount = enquiries.filter(
    (e) => e.leadStatus === "Converted"
  ).length;
  const lostCount = enquiries.filter((e) =>
    ["Low budget", "No Response", "Junk", "Not Converted"].includes(
      e.leadStatus
    )
  ).length;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
            <HelpCircle className="w-7 h-7 text-brand-600" />
            <span>Enquiries & Leads Management (CRM)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track host enquiry pipeline states, log follow-ups, and send custom
            booking confirmations directly to guests.
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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Enquiries
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {totalCount}
            </h3>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              In Follow-Up
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {inPipelineCount}
            </h3>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Converted Bookings
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {convertedCount}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Closed / Lost / Junk
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {lostCount}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, guest, phone, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1" />
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div> */}
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm font-medium">
            Loading enquiries pipeline...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Failed to Load Enquiries
          </h3>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchEnquiries}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No matching enquiries found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Guest</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Stay Dates</th>
                  <th className="py-4 px-6">Est. Price</th>
                  <th className="py-4 px-6">Lead Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEnquiries.map((enq) => {
                  const guestName =
                    enq.customerId?.name || enq.guestInfo?.name || "Guest";
                  const guestEmail =
                    enq.customerId?.email || enq.guestInfo?.email || "N/A";
                  const guestPhone =
                    enq.customerId?.phone || enq.guestInfo?.phone;
                  const guestNotes =
                    enq.notes ||
                    enq.guestInfo?.notes ||
                    enq.guestInfo?.specialRequests;
                  const currentLeadStatus = enq.leadStatus || "New Enquiry";

                  return (
                    <tr
                      key={enq._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Ref Code & Guest */}
                      <td className="py-4 px-3">
                        <div className="font-mono font-bold text-brand-600 text-xs">
                          #{enq.bookingCode || enq._id?.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-slate-900 font-bold text-sm mt-0.5">
                          {guestName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a
                            href={`mailto:${guestEmail}`}
                            className="hover:text-brand-600"
                          >
                            {guestEmail}
                          </a>
                        </div>
                        {guestPhone && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a
                              href={`tel:${guestPhone}`}
                              className="hover:text-brand-600 font-medium"
                            >
                              {guestPhone}
                            </a>
                          </div>
                        )}
                        {guestNotes && (
                          <p className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg mt-1 italic border border-slate-200 line-clamp-1 max-w-xs">
                            "{guestNotes}"
                          </p>
                        )}
                      </td>

                      {/* Target Property */}
                      <td className="py-4 px-2 max-w-40">
                        <div className="flex items-start gap-2.5">
                          <div className="truncate">
                            <div className="text-slate-900 font-semibold truncate text-sm">
                              {formatDate(enq.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 max-w-55">
                        <div className="flex items-start gap-2.5">
                          <Home className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <div className="text-slate-900 font-semibold truncate text-sm">
                              {enq.propertyId?.title || "Villa Property"}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {enq.propertyId?.address ||
                                enq.propertyId?.city ||
                                "India"}
                            </div>
                            {enq.rooms && enq.rooms.length > 0 && (
                              <div className="text-[10px] text-brand-700 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5 w-fit mt-1 font-semibold">
                                Rooms:{" "}
                                {enq.rooms
                                  .map((r) =>
                                    String(r).replace(/^room\s*/i, "")
                                  )
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Stay Dates */}
                      <td className="py-4 px-6 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {formatDate(enq.checkIn)} &ndash;{" "}
                            {formatDate(enq.checkOut)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <GuestsIcon className="w-3 h-3" />
                          <span>
                            {enq.guests || enq.guestsCount || 1} Guests
                          </span>
                        </div>
                      </td>

                      {/* Est. Price */}
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                        ₹{enq.totalAmount?.toLocaleString("en-IN") || "0"}
                      </td>

                      {/* Lead Status (CRM) Selector */}
                      <td className="py-4 px-6">
                        <Select
                          value={currentLeadStatus}
                          onChange={(val) =>
                            handleLeadStatusChange(enq._id, val)
                          }
                          disabled={actionLoading === enq._id}
                          className="w-52 custom-select-sm"
                          options={LEAD_STATUS_OPTIONS}
                        />
                      </td>

                      {/* Action - Send Confirmation */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenConfirmModal(enq)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs transition-all hover:scale-105"
                          title="Send Confirmation Email & Lock Dates"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation & Email Modal */}
      <Modal
        open={!!selectedEnquiryForConfirm}
        onCancel={() => {
          setSelectedEnquiryForConfirm(null);
          setCustomMessage("");
        }}
        footer={null}
        centered
        width={580}
      >
        <div className="p-4 space-y-5 text-left font-sans">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Send Confirmation & Lock Dates
              </h3>
              <p className="text-xs text-slate-500">
                Lock stay dates and notify guest via email
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-2">
              <p>
                <strong className="text-slate-900">Enquiry Code:</strong> #
                {selectedEnquiryForConfirm?.bookingCode}
              </p>
              <p>
                <strong className="text-slate-900">Guest Name:</strong>{" "}
                {selectedEnquiryForConfirm?.customerId?.name ||
                  selectedEnquiryForConfirm?.guestInfo?.name ||
                  "Guest"}
              </p>
              <p>
                <strong className="text-slate-900">Guest Email:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  {selectedEnquiryForConfirm?.customerId?.email ||
                    selectedEnquiryForConfirm?.guestInfo?.email ||
                    "N/A"}
                </span>
              </p>
              <p>
                <strong className="text-slate-900">Total Payable:</strong> ₹
                {selectedEnquiryForConfirm?.totalAmount?.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
            <p className="pt-1 border-t border-slate-200">
              <strong className="text-slate-900">Property:</strong>{" "}
              {selectedEnquiryForConfirm?.propertyId?.title}
            </p>
            <p>
              <strong className="text-slate-900">Stay Dates:</strong>{" "}
              <span className="font-semibold text-emerald-700">
                {formatDate(selectedEnquiryForConfirm?.checkIn)} to{" "}
                {formatDate(selectedEnquiryForConfirm?.checkOut)}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4 text-brand-600" />
              <span>
                Personal Note / Message to Guest (Included in Confirmation
                Email):
              </span>
            </label>
            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter a message to the guest that will be delivered in their confirmation email..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all resize-none"
            />
            <p className="text-[11px] text-slate-400">
              The guest will receive a formal confirmation email containing all
              stay specs, this note, and a direct link to complete their
              payment.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setSelectedEnquiryForConfirm(null);
                setCustomMessage("");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={confirming}
              onClick={handleSendConfirmation}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all hover:scale-105"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locking Dates & Sending Mail...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Confirmation Email & Lock Dates</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Enquiries;
