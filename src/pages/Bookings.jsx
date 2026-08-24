import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  Building,
  User,
  Search,
  Mail,
  Home,
  XCircle,
  AlertCircle,
  Unlock,
  ShieldAlert,
  Phone,
} from "lucide-react";
import { Modal, message } from "antd";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Date release modal state
  const [selectedBookingForRelease, setSelectedBookingForRelease] =
    useState(null);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getBookings();
      setBookings(res.data?.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Could not retrieve bookings data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseBookingDates = async () => {
    if (!selectedBookingForRelease) return;
    try {
      setReleasing(true);
      const res = await adminAPI.releaseBookingDates(
        selectedBookingForRelease._id
      );
      message.success(
        res.message || "Dates released successfully to calendar."
      );
      setSelectedBookingForRelease(null);
      fetchBookings();
    } catch (err) {
      console.error("Error releasing booking dates:", err);
      message.error(err.message || "Failed to release dates.");
    } finally {
      setReleasing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
      case "PAID":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "PENDING":
      case "PENDING_APPROVAL":
      case "PENDING_PAYMENT":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "CANCELLED":
      case "FAILED":
      case "REFUNDED":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-gray-800 border-gray-700 text-gray-400";
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

  const filteredBookings = bookings.filter((bk) => {
    const code = bk.bookingCode || bk._id || "";
    const guestName = bk.customerId?.name || bk.guestInfo?.name || "";
    const guestEmail = bk.customerId?.email || bk.guestInfo?.email || "";
    const guestPhone = bk.customerId?.phone || bk.guestInfo?.phone || "";
    const propTitle = bk.propertyId?.title || "";

    return (
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-brand-400" />
            <span>Bookings Stream & Calendar Management</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Complete history and real-time feed of guest vacation reservations
            across all property listings. Release held dates anytime.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by booking code, guest, phone, property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f172a]/60 border border-gray-800 rounded-3xl">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
          <p className="text-gray-400 text-sm font-medium">
            Fetching bookings database...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-950/20 border border-red-900/40 rounded-3xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">
            Failed to Load Bookings
          </h3>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="py-2 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center bg-[#0f172a]/60 border border-gray-800 rounded-3xl">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">
            No bookings found
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            No reservations logged matching your search.
          </p>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                All Reserved Bookings
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Stream of guest vacation reservations & availability locks
              </p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-900 px-3 py-1 border border-gray-800 rounded-lg">
              Total:{" "}
              <span className="text-white font-bold">
                {filteredBookings.length}
              </span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-[#1e293b]/40">
                  <th className="p-4 pl-6">ID & Guest</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Stay Dates</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total Price</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-sm">
                {filteredBookings.map((bk) => (
                  <tr
                    key={bk._id}
                    className="hover:bg-[#1e293b]/30 transition-all"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-mono font-bold text-brand-400 text-xs">
                        #{bk.bookingCode || bk._id?.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-white font-medium mt-0.5">
                        {bk.customerId?.name || bk.guestInfo?.name || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span>
                          {bk.customerId?.email || bk.guestInfo?.email || "N/A"}
                        </span>
                      </div>
                      {(bk.customerId?.phone || bk.guestInfo?.phone) && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span>
                            {bk.customerId?.phone || bk.guestInfo?.phone}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 max-w-[260px]">
                      <div className="flex items-start gap-2">
                        <Home className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                        <div className="truncate">
                          <div className="text-white font-medium truncate">
                            {bk.propertyId?.title || "Unknown Property"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {bk.propertyId?.address || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs space-y-0.5">
                      <div className="text-white">
                        <span className="text-gray-500">In:</span>{" "}
                        {formatDate(bk.checkIn)}
                      </div>
                      <div className="text-white">
                        <span className="text-gray-500">Out:</span>{" "}
                        {formatDate(bk.checkOut)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] px-2.5 py-1 border rounded-full font-bold uppercase tracking-wider ${getStatusBadge(
                          bk.status
                        )}`}
                      >
                        {bk.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-white font-semibold text-base">
                      ₹{bk.totalAmount?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="p-4 pr-6 text-center">
                      {bk.status !== "CANCELLED" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForRelease(bk)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                          title="Release these dates back to the availability calendar"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Release Dates</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-600 italic">
                          Dates Released
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Date Release Confirmation Modal */}
      <Modal
        open={!!selectedBookingForRelease}
        onCancel={() => setSelectedBookingForRelease(null)}
        footer={null}
        centered
        width={500}
      >
        <div className="p-4 space-y-5 text-left">
          <div className="flex items-center gap-3 text-red-600">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Release Calendar Dates
              </h3>
              <p className="text-xs text-slate-500">
                Unlock property availability
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
            <p>
              <strong className="text-slate-900">Booking Code:</strong> #
              {selectedBookingForRelease?.bookingCode}
            </p>
            <p>
              <strong className="text-slate-900">Guest:</strong>{" "}
              {selectedBookingForRelease?.customerId?.name ||
                selectedBookingForRelease?.guestInfo?.name ||
                "Guest"}
            </p>
            <p>
              <strong className="text-slate-900">Property:</strong>{" "}
              {selectedBookingForRelease?.propertyId?.title}
            </p>
            <p>
              <strong className="text-slate-900">Dates to Release:</strong>{" "}
              <span className="font-semibold text-red-600">
                {formatDate(selectedBookingForRelease?.checkIn)} to{" "}
                {formatDate(selectedBookingForRelease?.checkOut)}
              </span>
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Releasing these dates will immediately unlock the calendar on the
            live Roamigo website, allowing new guests to enquire and book these
            dates. The reservation status will be updated to{" "}
            <strong>CANCELLED</strong>.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedBookingForRelease(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all"
            >
              Keep Locked
            </button>
            <button
              type="button"
              disabled={releasing}
              onClick={handleReleaseBookingDates}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
            >
              {releasing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Release Dates</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;
