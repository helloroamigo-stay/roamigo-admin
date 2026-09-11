import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar as AntCalendar,
  DatePicker,
  message,
  Tag,
  Drawer,
  Input,
  Select,
  Tooltip,
} from "antd";
import {
  ArrowLeft,
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
  Link as LinkIcon,
  Globe,
  Plus,
  ExternalLink,
  DollarSign,
  Info,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminAPI } from "../services/api";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// Helper to format price in Thousands (e.g., 11200 -> ₹11.2K, 5600 -> ₹5.6K)
const formatPriceK = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "";
  if (amount >= 1000) {
    const kVal = amount / 1000;
    return `₹${Number.isInteger(kVal) ? kVal : kVal.toFixed(1)}K`;
  }
  return `₹${amount}`;
};

const PropertyCalendarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // iCal Sync state
  const [icalFeeds, setIcalFeeds] = useState([]);
  const [newFeedName, setNewFeedName] = useState("Airbnb");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [addingFeed, setAddingFeed] = useState(false);
  const [syncingFeeds, setSyncingFeeds] = useState(false);
  const [copiedICal, setCopiedICal] = useState(false);

  // Selected Date Drawer state
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Range Actions state
  const [releaseRange, setReleaseRange] = useState(null);
  const [blockRange, setBlockRange] = useState(null);
  const [blockReason, setBlockReason] = useState("Admin manual block");
  const [customPriceOverride, setCustomPriceOverride] = useState("");

  // Dynamic Custom Rates State
  const [customRateRange, setCustomRateRange] = useState(null);
  const [daysOfWeek, setDaysOfWeek] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [customRateInput, setCustomRateInput] = useState("");
  const [customExtraAdultFeeInput, setCustomExtraAdultFeeInput] = useState("");
  const [customExtraChildFeeInput, setCustomExtraChildFeeInput] = useState("");
  const [customRateStatus, setCustomRateStatus] = useState("open"); // "open" | "closed"
  const [customRateReason, setCustomRateReason] =
    useState("Custom rate update");

  // Single date drawer rate input
  const [singleDateCustomPrice, setSingleDateCustomPrice] = useState("");
  const [singleDateExtraAdultPrice, setSingleDateExtraAdultPrice] =
    useState("");
  const [singleDateExtraChildPrice, setSingleDateExtraChildPrice] =
    useState("");

  const handleToggleDayOfWeek = (dayIdx) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayIdx)
        ? prev.filter((d) => d !== dayIdx)
        : [...prev, dayIdx]
    );
  };

  const handleUpdateCustomRates = async () => {
    if (!customRateRange || customRateRange.length !== 2) {
      message.warning("Please select a date range for custom rates.");
      return;
    }
    const [start, end] = customRateRange;
    try {
      setActionLoading(true);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
        priceOverride: customRateInput ? Number(customRateInput) : undefined,
        extraAdultFeeOverride: customExtraAdultFeeInput
          ? Number(customExtraAdultFeeInput)
          : undefined,
        extraChildFeeOverride: customExtraChildFeeInput
          ? Number(customExtraChildFeeInput)
          : undefined,
        isBlocked: customRateStatus === "closed",
        reason: customRateReason || "Custom rate update",
      };
      const res = await adminAPI.updateCustomRates(id, payload);
      message.success(res.message || "Custom rates updated successfully!");
      setCustomRateRange(null);
      setCustomRateInput("");
      setCustomExtraAdultFeeInput("");
      setCustomExtraChildFeeInput("");
      fetchData();
    } catch (err) {
      console.error("Error updating custom rates:", err);
      message.error(err.message || "Failed to update custom rates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSingleDateCustomRate = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    try {
      setActionLoading(true);
      const payload = {
        startDate: dateStr,
        endDate: dateStr,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        priceOverride: singleDateCustomPrice
          ? Number(singleDateCustomPrice)
          : undefined,
        extraAdultFeeOverride: singleDateExtraAdultPrice
          ? Number(singleDateExtraAdultPrice)
          : undefined,
        extraChildFeeOverride: singleDateExtraChildPrice
          ? Number(singleDateExtraChildPrice)
          : undefined,
        reason: "Single date rate update",
      };
      const res = await adminAPI.updateCustomRates(id, payload);
      message.success(res.message || "Single date rate updated!");
      setSingleDateCustomPrice("");
      setSingleDateExtraAdultPrice("");
      setSingleDateExtraChildPrice("");
      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error updating single date rate:", err);
      message.error(err.message || "Failed to update date rate.");
    } finally {
      setActionLoading(false);
    }
  };

  // Map for fast lookup by YYYY-MM-DD
  const availabilityMap = new Map();
  availabilities.forEach((item) => {
    const dateKey = item.dateStr || dayjs(item.date).format("YYYY-MM-DD");
    availabilityMap.set(dateKey, item);
  });

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [availRes, propRes] = await Promise.all([
        adminAPI.getPropertyAvailability(id),
        adminAPI.getPropertyById(id),
      ]);

      const propData = propRes.data?.property || null;
      setProperty(propData);
      setIcalFeeds(propData?.icalFeeds || []);

      const avList = availRes.data?.availabilities || [];
      setAvailabilities(avList);
      console.log(avList);
    } catch (err) {
      console.error("Failed to load property calendar data:", err);
      message.error(err.message || "Could not load property calendar data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Export iCal URL
  const exportICalUrl = `https://roamigo-backend.in/api/v1/properties/${id}/calendar.ics`;

  const handleCopyExportICal = () => {
    navigator.clipboard.writeText(exportICalUrl);
    setCopiedICal(true);
    message.success("Roamigo iCal export URL copied to clipboard!");
    setTimeout(() => setCopiedICal(false), 3000);
  };

  // Add iCal Feed
  const handleAddFeed = async (e) => {
    e.preventDefault();
    if (!newFeedUrl || !newFeedUrl.trim()) {
      message.warning("Please paste a valid iCal feed URL");
      return;
    }
    try {
      setAddingFeed(true);
      const res = await adminAPI.addICalFeed(id, {
        name: newFeedName || "Airbnb",
        url: newFeedUrl.trim(),
      });
      message.success(res.message || "iCal feed added and synced!");
      setIcalFeeds(res.data?.icalFeeds || []);
      setNewFeedUrl("");
      fetchData();
    } catch (err) {
      console.error("Error adding iCal feed:", err);
      message.error(err.message || "Failed to add iCal feed.");
    } finally {
      setAddingFeed(false);
    }
  };

  // Delete iCal Feed
  const handleDeleteFeed = async (feedId) => {
    try {
      setActionLoading(true);
      const res = await adminAPI.deleteICalFeed(id, feedId);
      message.success(res.message || "iCal feed removed");
      setIcalFeeds(res.data?.icalFeeds || []);
      fetchData();
    } catch (err) {
      console.error("Error deleting iCal feed:", err);
      message.error(err.message || "Failed to delete iCal feed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Sync All iCal Feeds
  const handleSyncAllFeeds = async () => {
    try {
      setSyncingFeeds(true);
      const res = await adminAPI.syncICalFeeds(id);
      message.success(res.message || "iCal feeds synced!");
      setIcalFeeds(res.data?.icalFeeds || []);
      fetchData();
    } catch (err) {
      console.error("Error syncing iCal feeds:", err);
      message.error(err.message || "Failed to sync iCal feeds.");
    } finally {
      setSyncingFeeds(false);
    }
  };

  // Release Single Date
  const handleReleaseSingleDate = async (item) => {
    try {
      setActionLoading(true);
      const payload = {
        dates: [item.dateStr || dayjs(item.date).format("YYYY-MM-DD")],
        bookingId: item.bookingId || undefined,
        cancelBooking: !!item.bookingId,
      };
      const res = await adminAPI.releasePropertyDates(id, payload);
      message.success(res.message || "Released date");
      fetchData();
    } catch (err) {
      console.error("Error releasing date:", err);
      message.error(err.message || "Failed to release date.");
    } finally {
      setActionLoading(false);
    }
  };

  // Release Date Range
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
      const res = await adminAPI.releasePropertyDates(id, payload);
      message.success(res.message || "Date range released successfully!");
      setReleaseRange(null);
      fetchData();
    } catch (err) {
      console.error("Error releasing range:", err);
      message.error(err.message || "Failed to release date range.");
    } finally {
      setActionLoading(false);
    }
  };

  // Block Date Range
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
      const res = await adminAPI.blockPropertyDates(id, payload);
      message.success(res.message || "Date range blocked successfully!");
      setBlockRange(null);
      fetchData();
    } catch (err) {
      console.error("Error blocking range:", err);
      message.error(err.message || "Failed to block date range.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Date Cell Click
  const handleDateSelect = (date, selectInfo) => {
    setSelectedDate(date);
    if (selectInfo?.source === "date") {
      setIsDrawerOpen(true);
    }
  };

  // Render Full Calendar Cell (matching reference screenshot style)
  const fullCellRender = (current, info) => {
    if (info.type !== "date") return info.originNode;

    const dateStr = current.format("YYYY-MM-DD");
    const isToday = current.isSame(dayjs(), "day");
    const isSelected = selectedDate && current.isSame(selectedDate, "day");

    const availability = availabilityMap.get(dateStr);
    const isBlocked = availability?.isBlocked;
    const isBooking =
      availability?.source === "BOOKING" || !!availability?.bookingId;
    const isICal = availability?.source === "ICAL_SYNC";
    const hasOverride =
      availability &&
      typeof availability.priceOverride === "number" &&
      availability.priceOverride > 0;

    const dailyPrice =
      availability?.priceOverride || property?.pricePerNight || 0;
    const priceText = formatPriceK(dailyPrice);

    return (
      <div
        onClick={() => handleDateSelect(current)}
        className={`h-full w-full p-1.5 flex flex-col justify-between rounded-2xl transition-all border cursor-pointer select-none min-h-[90px] ${
          isBlocked
            ? "bg-slate-100/90 border-slate-200 text-slate-400"
            : isSelected
            ? "bg-amber-500/10 border-amber-500 text-slate-900 shadow-sm"
            : "bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-xs text-slate-900"
        }`}
      >
        {/* Top Bar: Date Number Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
              isToday
                ? "bg-rose-500 text-white shadow-xs"
                : isBlocked
                ? "line-through text-slate-400 font-semibold"
                : "text-slate-900 font-bold"
            }`}
          >
            {current.date()}
          </span>

          {/* Badges */}
          {isBooking && (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <User className="w-2.5 h-2.5" />
              <span>Booked</span>
            </span>
          )}
          {isICal && !isBooking && (
            <span className="bg-sky-100 text-sky-800 border border-sky-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Globe className="w-2.5 h-2.5" />
              <span>iCal</span>
            </span>
          )}
          {hasOverride && !isBlocked && !isBooking && !isICal && (
            <span
              className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
              title="Custom Rate Override"
            >
              <DollarSign className="w-2.5 h-2.5" />
              <span>Custom</span>
            </span>
          )}
          {isBlocked && !isBooking && !isICal && (
            <span className="bg-slate-200 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" />
              <span>Blocked</span>
            </span>
          )}
        </div>

        {/* Bottom Bar: Daily Nightly Price */}
        <div className="mt-2 text-center">
          <span
            className={`text-xs font-extrabold font-mono tracking-tight block ${
              isBlocked ? "text-slate-400 opacity-70" : "text-slate-900"
            }`}
          >
            {priceText}
          </span>
          {availability?.notes && (
            <span className="text-[9px] text-slate-400 block truncate max-w-full font-medium">
              {availability.notes}
            </span>
          )}
        </div>
      </div>
    );
  };

  const selectedDateStr = selectedDate ? selectedDate.format("YYYY-MM-DD") : "";
  const selectedAvailability = availabilityMap.get(selectedDateStr);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-380 mx-auto space-y-6 font-sans">
      {/* 1. Header Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/properties")}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl cursor-pointer transition-all border border-slate-200"
            title="Back to properties list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {property?.title || "Property Calendar"}
              </h1>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0} / night
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
              <span>
                {property?.address || property?.cityId?.name || "India"}
              </span>
              <span>•</span>
              <span>Full-Page Calendar & Date Management</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold cursor-pointer transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Total Blocked Nights
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {availabilities.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              iCal Feeds Synced
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {icalFeeds.length} Feeds
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Base Price / Night
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Auto-Sync Status
            </span>
            <span className="text-xs font-bold text-emerald-600 block">
              Every 30 mins (Active)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Dates & Custom Rates Drawer (Dynamic Host Pricing) */}
      <div className="bg-white border border-blue-100 bg-[#fbfdff] rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Dates & Custom Rates Drawer (Dynamic Host Pricing)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Set weekend surcharges or custom rates filtered by day of the week (e.g. Fri & Sat).
            </p>
          </div>
          <button
            type="button"
            onClick={handleUpdateCustomRates}
            disabled={actionLoading || !customRateRange}
            className="px-5 py-2.5 bg-[#1849C7] hover:bg-blue-800 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Custom Rates</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* Range Picker */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-bold uppercase text-slate-500">
              DATE RANGE
            </label>
            <RangePicker
              value={customRateRange}
              onChange={setCustomRateRange}
              format="YYYY-MM-DD"
              className="w-full rounded-2xl text-xs py-2"
              placeholder={["Start Date", "End Date"]}
            />
          </div>

          {/* Custom Rate Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">
              BASE NIGHT RATE (INR)
            </label>
            <Input
              type="number"
              placeholder={`Base: ₹${property?.pricePerNight || 0}`}
              value={customRateInput}
              onChange={(e) => setCustomRateInput(e.target.value)}
              className="rounded-2xl text-xs py-2 font-mono font-bold"
            />
          </div>

          {/* Extra Adult Fee Override */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">
              EXTRA ADULT FEE (INR)
            </label>
            <Input
              type="number"
              placeholder={`Base: ₹${property?.extraAdultFee || 0}`}
              value={customExtraAdultFeeInput}
              onChange={(e) => setCustomExtraAdultFeeInput(e.target.value)}
              className="rounded-2xl text-xs py-2 font-mono font-bold"
            />
          </div>

          {/* Extra Child Fee Override */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">
              EXTRA KID FEE (INR)
            </label>
            <Input
              type="number"
              placeholder={`Base: ₹${property?.extraChildFee || 0}`}
              value={customExtraChildFeeInput}
              onChange={(e) => setCustomExtraChildFeeInput(e.target.value)}
              className="rounded-2xl text-xs py-2 font-mono font-bold"
            />
          </div>
        </div>

        {/* Day of Week Checkboxes */}
        <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-blue-50">
          <span className="text-xs font-bold text-slate-700">
            Apply to Days:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, idx) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDayOfWeek(idx)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-1 rounded-full border cursor-pointer select-none transition-all ${
                    daysOfWeek.includes(idx)
                      ? "bg-[#1877f2] text-white border-[#1877f2] font-bold shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <span>{day}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 4. Main Full-Page Calendar + iCal Sync Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Full Ant Design Calendar */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-600" />
              <span>Interactive Availability Calendar</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Today</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span>Blocked</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                <span>Booked</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
                <span>iCal Sync</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">
                Reading property calendar...
              </p>
            </div>
          ) : (
            <div className="custom-full-calendar">
              <AntCalendar
                headerRender={({ value, type, onChange, onTypeChange }) => {
                  const current = value.clone();
                  const localeData = value.localeData();
                  const months = [];
                  for (let i = 0; i < 12; i++) {
                    months.push(localeData.monthsShort(current.month(i)));
                  }

                  const monthOptions = [];
                  for (let i = 0; i < 12; i++) {
                    monthOptions.push(
                      <Select.Option key={i} value={i}>
                        {months[i]}
                      </Select.Option>
                    );
                  }

                  const year = value.year();
                  const month = value.month();
                  const options = [];
                  for (let i = year - 5; i < year + 5; i += 1) {
                    options.push(
                      <Select.Option key={i} value={i}>
                        {i}
                      </Select.Option>
                    );
                  }

                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-slate-100 mb-4 bg-slate-50/80 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = value.clone().subtract(1, "month");
                          onChange(newValue);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 rounded-2xl text-xs cursor-pointer transition-all shadow-2xs"
                      >
                        <ChevronLeft className="w-4 h-4 text-amber-600" />
                        <span>Previous Month</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <Select
                          size="small"
                          dropdownMatchSelectWidth={false}
                          className="font-bold"
                          value={year}
                          onChange={(newYear) => {
                            const now = value.clone().year(newYear);
                            onChange(now);
                          }}
                        >
                          {options}
                        </Select>
                        <Select
                          size="small"
                          dropdownMatchSelectWidth={false}
                          value={month}
                          onChange={(newMonth) => {
                            const now = value.clone().month(newMonth);
                            onChange(now);
                          }}
                        >
                          {monthOptions}
                        </Select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newValue = value.clone().add(1, "month");
                          onChange(newValue);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 rounded-2xl text-xs cursor-pointer transition-all shadow-2xs"
                      >
                        <span>Next Month</span>
                        <ChevronRight className="w-4 h-4 text-amber-600" />
                      </button>
                    </div>
                  );
                }}
                fullCellRender={fullCellRender}
                onSelect={handleDateSelect}
              />
            </div>
          )}
        </div>

        {/* Right 1 Col: iCal Sync Settings & Feeds */}
        <div className="space-y-6">
          {/* 3. Action Toolbar (Range Release & Range Block) */}
          <div className="">
            {/* Release Range Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>Release Date Range</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Unlock Calendar
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RangePicker
                  value={releaseRange}
                  onChange={setReleaseRange}
                  format="YYYY-MM-DD"
                  className="w-full rounded-2xl text-xs py-2"
                  placeholder={["Start Date", "End Date"]}
                />
                <button
                  type="button"
                  onClick={handleReleaseRange}
                  disabled={actionLoading || !releaseRange}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all shrink-0 shadow-xs"
                >
                  <span>Release</span>
                </button>
              </div>
            </div>

            {/* Manual Block Range Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Block Custom Dates</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Maintenance / Private
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RangePicker
                  value={blockRange}
                  onChange={setBlockRange}
                  format="YYYY-MM-DD"
                  className="w-full rounded-2xl text-xs py-2"
                  placeholder={["Start Date", "End Date"]}
                />
                <button
                  type="button"
                  onClick={handleBlockRange}
                  disabled={actionLoading || !blockRange}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-2xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all shrink-0 shadow-xs"
                >
                  <span>Block</span>
                </button>
              </div>
            </div>
          </div>

          {/* iCal Control Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-5 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  iCal Calendar Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSyncAllFeeds}
                disabled={syncingFeeds}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer transition-all shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    syncingFeeds ? "animate-spin" : ""
                  }`}
                />
                <span>Sync Now</span>
              </button>
            </div>

            {/* 1. Export Roamigo Feed Link */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Export Roamigo iCal Link</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Paste into Airbnb or Goibibo ("Import Calendar") to block
                Roamigo bookings on their platforms.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={exportICalUrl}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-300 focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyExportICal}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    copiedICal
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                >
                  {copiedICal ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedICal ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* 2. Import External OTA Feed */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>2. Import External OTA Feed</span>
                </span>
              </div>
              <form onSubmit={handleAddFeed} className="space-y-2.5">
                <div className="flex flex-col gap-2">
                  <Select
                    value={newFeedName}
                    onChange={setNewFeedName}
                    className="w-full"
                    options={[
                      { value: "Airbnb", label: "Airbnb" },
                      { value: "Goibibo", label: "Goibibo" },
                      { value: "MakeMyTrip", label: "MakeMyTrip" },
                      { value: "VRBO", label: "VRBO" },
                      { value: "Booking.com", label: "Booking.com" },
                      { value: "Other", label: "Other" },
                    ]}
                  />
                  <input
                    type="url"
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                  />
                  <button
                    type="submit"
                    disabled={addingFeed || !newFeedUrl}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                  >
                    {addingFeed ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Add External Feed</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Active Synced Feeds */}
            {icalFeeds.length > 0 && (
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Configured Feeds ({icalFeeds.length})
                </h4>
                <div className="space-y-2">
                  {icalFeeds.map((feed) => (
                    <div
                      key={feed._id || feed.url}
                      className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700/70 rounded-2xl"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400">
                            {feed.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              feed.syncStatus === "SUCCESS"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : feed.syncStatus === "FAILED"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {feed.syncStatus || "PENDING"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-1">
                          {feed.lastSyncMessage || feed.url}
                        </p>
                        {feed.lastSyncedAt && (
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            Last synced:{" "}
                            {dayjs(feed.lastSyncedAt).format("DD MMM, HH:mm")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeed(feed._id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-xl cursor-pointer transition-all shrink-0"
                        title="Remove iCal Feed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Selected Date Action Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            <span>
              Date Actions:{" "}
              {selectedDate ? selectedDate.format("ddd, DD MMMM YYYY") : ""}
            </span>
          </div>
        }
        placement="right"
        width={420}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        className="custom-admin-drawer"
      >
        <div className="space-y-6 font-sans text-xs text-slate-700">
          {/* Status Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Status Overview
              </span>
              {selectedAvailability?.isBlocked ? (
                <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Unavailable / Blocked</span>
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Available for booking</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Nightly Rate:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {formatPriceK(
                    selectedAvailability?.priceOverride ||
                      property?.pricePerNight ||
                      0
                  )}
                </span>
              </div>
              {selectedAvailability?.source && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Block Source:</span>
                  <span className="font-bold text-slate-800">
                    {selectedAvailability.source}
                  </span>
                </div>
              )}
              {selectedAvailability?.notes && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Block Reason / Notes:</span>
                  <span className="font-bold text-slate-800">
                    {selectedAvailability.notes}
                  </span>
                </div>
              )}
              {selectedAvailability?.booking?.bookingCode && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-bold text-amber-700 font-mono">
                    #{selectedAvailability.booking.bookingCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Quick Actions</h4>

            {/* Set Custom Price for Selected Date */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">
                Set Custom Rate for{" "}
                {selectedDate ? selectedDate.format("DD MMM") : ""}
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={`Base: ₹${property?.pricePerNight || 0}`}
                  value={singleDateCustomPrice}
                  onChange={(e) => setSingleDateCustomPrice(e.target.value)}
                  className="rounded-xl text-xs py-2 font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleSaveSingleDateCustomRate}
                  disabled={actionLoading || !singleDateCustomPrice}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shrink-0"
                >
                  Save Rate
                </button>
              </div>
            </div>

            {selectedAvailability?.isBlocked ? (
              <button
                type="button"
                onClick={() => {
                  handleReleaseSingleDate(selectedAvailability);
                  setIsDrawerOpen(false);
                }}
                disabled={actionLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <Unlock className="w-4 h-4" />
                <span>Release Date (Unlock for booking)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setBlockRange([selectedDate, selectedDate]);
                  handleBlockRange();
                  setIsDrawerOpen(false);
                }}
                disabled={actionLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <Lock className="w-4 h-4" />
                <span>Block This Date</span>
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default PropertyCalendarPage;
