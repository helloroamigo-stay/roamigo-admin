import React, { useState, useEffect } from "react";
import { Modal, DatePicker, message, Tag, Table } from "antd";
import {
  Calendar as CalendarIcon,
  Unlock,
  Lock,
  Loader2,
  RefreshCw,
  Trash2,
  AlertTriangle,
  User,
  ShieldCheck,
  Search,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const PropertyCalendarModal = ({ property, isOpen, onClose }) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Release Range state
  const [releaseRange, setReleaseRange] = useState(null);

  // Block Range state
  const [blockRange, setBlockRange] = useState(null);
  const [blockReason, setBlockReason] = useState("Admin manual block");

  const fetchAvailability = async () => {
    if (!property?._id) return;
    try {
      setLoading(true);
      const res = await adminAPI.getPropertyAvailability(property._id);
      setAvailabilities(res.data?.availabilities || []);
    } catch (err) {
      console.error("Failed to load property availability:", err);
      message.error(err.message || "Could not load calendar availability.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && property?._id) {
      fetchAvailability();
    } else {
      setAvailabilities([]);
      setReleaseRange(null);
      setBlockRange(null);
    }
  }, [isOpen, property?._id]);

  const handleReleaseSingleDate = async (item) => {
    try {
      setActionLoading(true);
      const payload = {
        dates: [item.dateStr],
        bookingId: item.bookingId || undefined,
        cancelBooking: !!item.bookingId,
      };
      const res = await adminAPI.releasePropertyDates(property._id, payload);
      message.success(res.message || `Released date: ${item.dateStr}`);
      fetchAvailability();
    } catch (err) {
      console.error("Error releasing date:", err);
      message.error(err.message || "Failed to release date.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseRange = async () => {
    if (!releaseRange || releaseRange.length !== 2) {
      message.warning("Please select a date range to release.");
      return;
    }
    const [start, end] = releaseRange;
    try {
      setActionLoading(true);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
      };
      const res = await adminAPI.releasePropertyDates(property._id, payload);
      message.success(res.message || "Date range released successfully!");
      setReleaseRange(null);
      fetchAvailability();
    } catch (err) {
      console.error("Error releasing range:", err);
      message.error(err.message || "Failed to release date range.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockRange = async () => {
    if (!blockRange || blockRange.length !== 2) {
      message.warning("Please select a date range to block.");
      return;
    }
    const [start, end] = blockRange;
    try {
      setActionLoading(true);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        reason: blockReason || "Admin manual block",
      };
      const res = await adminAPI.blockPropertyDates(property._id, payload);
      message.success(res.message || "Date range blocked successfully!");
      setBlockRange(null);
      fetchAvailability();
    } catch (err) {
      console.error("Error blocking range:", err);
      message.error(err.message || "Failed to block date range.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAvailabilities = availabilities.filter((item) => {
    const term = searchTerm.toLowerCase();
    const dateStr = item.dateStr || "";
    const bookingCode = item.booking?.bookingCode || "";
    const guestName =
      item.booking?.customerId?.name || item.booking?.guestInfo?.name || "";
    const source = item.source || "";

    return (
      dateStr.toLowerCase().includes(term) ||
      bookingCode.toLowerCase().includes(term) ||
      guestName.toLowerCase().includes(term) ||
      source.toLowerCase().includes(term)
    );
  });

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={900}
      className="custom-admin-modal"
    >
      <div className="p-4 space-y-6 text-left font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Calendar & Date Management
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                {property?.title} • {property?.cityId?.name || property?.city}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAvailability}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 self-start sm:self-auto"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats and Action Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Release Range Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Unlock className="w-4 h-4 text-emerald-600" />
                <span>Release Date Range</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Unlock Calendar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RangePicker
                value={releaseRange}
                onChange={setReleaseRange}
                format="YYYY-MM-DD"
                className="w-full rounded-xl text-xs py-1.5"
                placeholder={["Start Date", "End Date"]}
              />
              <button
                type="button"
                onClick={handleReleaseRange}
                disabled={actionLoading || !releaseRange}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all shrink-0 shadow-xs"
              >
                <span>Release</span>
              </button>
            </div>
          </div>

          {/* Quick Manual Block Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Block Custom Dates</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Maintenance / Private
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RangePicker
                value={blockRange}
                onChange={setBlockRange}
                format="YYYY-MM-DD"
                className="w-full rounded-xl text-xs py-1.5"
                placeholder={["Start Date", "End Date"]}
              />
              <button
                type="button"
                onClick={handleBlockRange}
                disabled={actionLoading || !blockRange}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all shrink-0 shadow-xs"
              >
                <span>Block</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & List of Blocked/Booked Dates */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Unavailable & Blocked Dates ({availabilities.length})
              </h3>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search date, booking, guest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">
                Reading property calendar...
              </p>
            </div>
          ) : filteredAvailabilities.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
              <CalendarIcon className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">
                No Blocked Dates Found
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                All dates for this property are currently open and available on
                the live website.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="p-3 pl-4">Date</th>
                    <th className="p-3">Source & Reason</th>
                    <th className="p-3">Booking Reference</th>
                    <th className="p-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                  {filteredAvailabilities.map((item) => {
                    const isBooking =
                      item.source === "BOOKING" || !!item.bookingId;
                    const bookingCode = item.booking?.bookingCode;
                    const guestName =
                      item.booking?.customerId?.name ||
                      item.booking?.guestInfo?.name;

                    return (
                      <tr
                        key={item.id || item.dateStr}
                        className="hover:bg-slate-50 transition-all"
                      >
                        <td className="p-3 pl-4 font-mono font-bold text-slate-900">
                          {dayjs(item.dateStr).format("ddd, DD MMM YYYY")}
                        </td>
                        <td className="p-3">
                          {isBooking ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <User className="w-3 h-3" />
                              <span>Guest Reservation</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              <Lock className="w-3 h-3" />
                              <span>Manual Block</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {bookingCode ? (
                            <div>
                              <span className="font-mono font-bold text-amber-700">
                                #{bookingCode}
                              </span>
                              {guestName && (
                                <span className="text-slate-500 ml-1">
                                  ({guestName})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">
                              Admin block / Override
                            </span>
                          )}
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleReleaseSingleDate(item)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                            title="Release this date"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Release</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </Modal>
  );
};
