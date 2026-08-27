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
  Copy,
  Check,
  Link,
  Globe,
  Plus,
  ExternalLink,
  Layers,
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

  // iCal Sync state
  const [icalFeeds, setIcalFeeds] = useState([]);
  const [newFeedName, setNewFeedName] = useState("Airbnb");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [addingFeed, setAddingFeed] = useState(false);
  const [syncingFeeds, setSyncingFeeds] = useState(false);
  const [copiedICal, setCopiedICal] = useState(false);

  const fetchPropertyData = async () => {
    if (!property?._id) return;
    try {
      setLoading(true);
      const [availRes, propRes] = await Promise.all([
        adminAPI.getPropertyAvailability(property._id),
        adminAPI.getPropertyById(property._id),
      ]);
      setAvailabilities(availRes.data?.availabilities || []);
      setIcalFeeds(propRes.data?.property?.icalFeeds || property.icalFeeds || []);
    } catch (err) {
      console.error("Failed to load property availability:", err);
      message.error(err.message || "Could not load calendar availability.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = fetchPropertyData;

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

  const exportICalUrl = `https://roamigo-backend.in/api/v1/properties/${property?._id}/calendar.ics`;

  const handleCopyExportICal = () => {
    navigator.clipboard.writeText(exportICalUrl);
    setCopiedICal(true);
    message.success("Roamigo iCal export URL copied to clipboard!");
    setTimeout(() => setCopiedICal(false), 3000);
  };

  const handleAddFeed = async (e) => {
    e.preventDefault();
    if (!newFeedUrl || !newFeedUrl.trim()) {
      message.warning("Please paste a valid iCal feed URL");
      return;
    }
    try {
      setAddingFeed(true);
      const res = await adminAPI.addICalFeed(property._id, {
        name: newFeedName || "Airbnb",
        url: newFeedUrl.trim(),
      });
      message.success(res.message || "iCal feed added and synced!");
      setIcalFeeds(res.data?.icalFeeds || []);
      setNewFeedUrl("");
      fetchAvailability();
    } catch (err) {
      console.error("Error adding iCal feed:", err);
      message.error(err.message || "Failed to add iCal feed.");
    } finally {
      setAddingFeed(false);
    }
  };

  const handleDeleteFeed = async (feedId) => {
    try {
      setActionLoading(true);
      const res = await adminAPI.deleteICalFeed(property._id, feedId);
      message.success(res.message || "Feed removed");
      setIcalFeeds(res.data?.icalFeeds || []);
      fetchAvailability();
    } catch (err) {
      console.error("Error deleting iCal feed:", err);
      message.error(err.message || "Failed to delete iCal feed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncAllFeeds = async () => {
    try {
      setSyncingFeeds(true);
      const res = await adminAPI.syncICalFeeds(property._id);
      message.success(res.message || "iCal feeds synced!");
      setIcalFeeds(res.data?.icalFeeds || []);
      fetchAvailability();
    } catch (err) {
      console.error("Error syncing iCal feeds:", err);
      message.error(err.message || "Failed to sync iCal feeds.");
    } finally {
      setSyncingFeeds(false);
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

        {/* --- iCAL CALENDAR SYNC SECTION (AIRBNB, GOIBIBO, MMT) --- */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-lg border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>iCal Calendar Sync (Airbnb, Goibibo, MakeMyTrip)</span>
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Auto-Sync Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Automatically sync availability with external OTA platforms to prevent double bookings.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncAllFeeds}
              disabled={syncingFeeds}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer transition-all shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingFeeds ? "animate-spin" : ""}`} />
              <span>Sync All Feeds Now</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. Export Roamigo iCal Feed */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Export Roamigo Calendar (.ics)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-semibold">
                  For Airbnb / Goibibo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Paste this link into Airbnb or Goibibo ("Import Calendar") so they automatically block Roamigo bookings.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={exportICalUrl}
                  className="flex-1 bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-300 focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyExportICal}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${copiedICal
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                    }`}
                >
                  {copiedICal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedICal ? "Copied!" : "Copy URL"}</span>
                </button>
              </div>
            </div>

            {/* 2. Import External iCal Feeds */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-sky-400" />
                  <span>2. Import External OTA Calendar</span>
                </span>
                <span className="text-[10px] text-sky-400 font-semibold">
                  Block dates on Roamigo
                </span>
              </div>
              <form onSubmit={handleAddFeed} className="space-y-2">
                <div className="flex flex-col items-center gap-2">
                  <select
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="Airbnb">Airbnb</option>
                    <option value="Goibibo">Goibibo</option>
                    <option value="MakeMyTrip">MakeMyTrip</option>
                    <option value="VRBO">VRBO</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="url"
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addingFeed || !newFeedUrl}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all shrink-0"
                  >
                    {addingFeed ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Add Feed</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Active Synced iCal Feeds List */}
          {icalFeeds.length > 0 && (
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Configured External Sync Feeds ({icalFeeds.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {icalFeeds.map((feed) => (
                  <div
                    key={feed._id || feed.url}
                    className="flex items-center justify-between p-2.5 bg-slate-800 border border-slate-700/60 rounded-xl"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400">
                          {feed.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${feed.syncStatus === "SUCCESS"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : feed.syncStatus === "FAILED"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-slate-700 text-slate-400"
                            }`}
                        >
                          {feed.syncStatus || "PENDING"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {feed.lastSyncMessage || feed.url}
                      </p>
                      {feed.lastSyncedAt && (
                        <p className="text-[9px] text-slate-500 mt-0.5">
                          Last synced: {dayjs(feed.lastSyncedAt).format("DD MMM, HH:mm")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeed(feed._id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg cursor-pointer transition-all shrink-0"
                      title="Remove iCal Feed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                          ) : item.source === "ICAL_SYNC" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              <Globe className="w-3 h-3 text-sky-600" />
                              <span>iCal Sync</span>
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
                          ) : item.notes || item.source === "ICAL_SYNC" ? (
                            <span className="text-slate-700 font-medium">
                              {item.notes || "Synced from external iCal"}
                            </span>
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
