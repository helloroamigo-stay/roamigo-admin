import React, { useState, useEffect, useRef } from "react";
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
  Minus,
  ExternalLink,
  DollarSign,
  Info,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  BedDouble,
  Layers,
  Home,
  CheckCircle2,
  XCircle,
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

  // Airbnb Drag-to-Select State & Refs
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragAnchor, setDragAnchor] = useState(null);
  const [selectionRange, setSelectionRange] = useState(null);
  const [rangeCustomPrice, setRangeCustomPrice] = useState("");
  const [rangeExtraAdultPrice, setRangeExtraAdultPrice] = useState("");
  const [rangeExtraChildPrice, setRangeExtraChildPrice] = useState("");

  // Multi-date discrete selection state (array of 'YYYY-MM-DD')
  const [selectedCustomDates, setSelectedCustomDates] = useState([]);

  const isMouseDownRef = useRef(false);
  const dragAnchorRef = useRef(null);
  const isDraggingRef = useRef(false);
  const shiftAnchorRef = useRef(null);
  const isShiftSelectingRef = useRef(false);

  const handleSelectDate = (date) => {
    if (!date) return;
    const dStr = date.format("YYYY-MM-DD");
    shiftAnchorRef.current = date;
    setSelectedDate(date);
    setSelectedCustomDates([dStr]);
    setSelectionRange([date, date]);
    setCustomRateRange([date, date]);
    setBlockRange([date, date]);
    setReleaseRange([date, date]);
    // setIsDrawerOpen(true);
  };

  // Range Actions state
  const [releaseRange, setReleaseRange] = useState(null);
  const [blockRange, setBlockRange] = useState(null);
  const [blockReason, setBlockReason] = useState("Admin manual block");
  const [customPriceOverride, setCustomPriceOverride] = useState("");

  // Room Count states for + / - steppers (no dropdowns)
  const [topRoomCount, setTopRoomCount] = useState(1);
  const [drawerRoomCount, setDrawerRoomCount] = useState(1);
  const [sidebarReleaseRoomCount, setSidebarReleaseRoomCount] = useState(1);
  const [sidebarBlockRoomCount, setSidebarBlockRoomCount] = useState(1);

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

  const isMultiDayRange =
    selectionRange &&
    selectionRange[0] &&
    selectionRange[1] &&
    !selectionRange[0].isSame(selectionRange[1], "day");

  const isMultiCustomDates = selectedCustomDates.length > 1;

  const nightsCount = isMultiDayRange
    ? selectionRange[1].diff(selectionRange[0], "day") + 1
    : 1;

  const handleToggleDayOfWeek = (dayIdx) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayIdx)
        ? prev.filter((d) => d !== dayIdx)
        : [...prev, dayIdx]
    );
  };

  const isRoomBased =
    (Array.isArray(property?.rooms) && property.rooms.length > 0) ||
    ["ROOMS", "ROOM", "HOTEL", "APARTMENT"].includes(
      property?.propertyType?.toUpperCase()
    );

  const propertyRooms = React.useMemo(() => {
    if (Array.isArray(property?.rooms) && property.rooms.length > 0) {
      return property.rooms.map((r, idx) => ({
        id: r.name || `room-${idx + 1}`,
        name: r.name
          ? r.name.startsWith("room-")
            ? `Room ${r.name.replace("room-", "")}`
            : r.name
          : `Room ${idx + 1}`,
        rawName: r.name || `room-${idx + 1}`,
        bed: r.bed || "",
        bath: r.bath || "",
      }));
    }
    const count = Math.max(1, property?.bedrooms || 1);
    return Array.from({ length: count }, (_, idx) => ({
      id: `room-${idx + 1}`,
      name: `Room ${idx + 1}`,
      rawName: `room-${idx + 1}`,
      bed: "",
      bath: "",
    }));
  }, [property]);

  const totalInventory = propertyRooms.length;

  const handleUpdateCustomRates = async () => {
    if (selectedCustomDates && selectedCustomDates.length > 1) {
      await handleApplyCustomDatesRates();
      return;
    }

    const effectiveRange =
      customRateRange &&
      customRateRange.length === 2 &&
      customRateRange[0] &&
      customRateRange[1]
        ? customRateRange
        : selectionRange &&
          selectionRange.length === 2 &&
          selectionRange[0] &&
          selectionRange[1]
        ? selectionRange
        : selectedDate
        ? [selectedDate, selectedDate]
        : null;

    if (!effectiveRange || !effectiveRange[0] || !effectiveRange[1]) {
      message.warning(
        "Please select a date range or click a date on the calendar first."
      );
      return;
    }

    const priceVal =
      customRateInput !== "" ? customRateInput : singleDateCustomPrice;
    const adultFeeVal =
      customExtraAdultFeeInput !== ""
        ? customExtraAdultFeeInput
        : singleDateExtraAdultPrice;
    const childFeeVal =
      customExtraChildFeeInput !== ""
        ? customExtraChildFeeInput
        : singleDateExtraChildPrice;

    if (
      (priceVal === undefined || priceVal === "") &&
      (adultFeeVal === undefined || adultFeeVal === "") &&
      (childFeeVal === undefined || childFeeVal === "")
    ) {
      message.warning(
        "Please enter a base nightly rate or extra adult/kid fee override to apply."
      );
      return;
    }

    const start = dayjs(effectiveRange[0]);
    const end = dayjs(effectiveRange[1]);

    try {
      setActionLoading(true);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
        reason: customRateReason || "Custom rate update",
      };

      if (
        priceVal !== "" &&
        priceVal !== undefined &&
        !isNaN(Number(priceVal))
      ) {
        payload.priceOverride = Number(priceVal);
      }
      if (
        adultFeeVal !== "" &&
        adultFeeVal !== undefined &&
        !isNaN(Number(adultFeeVal))
      ) {
        payload.extraAdultFeeOverride = Number(adultFeeVal);
        payload.extraAdultFee = Number(adultFeeVal);
      }
      if (
        childFeeVal !== "" &&
        childFeeVal !== undefined &&
        !isNaN(Number(childFeeVal))
      ) {
        payload.extraChildFeeOverride = Number(childFeeVal);
        payload.extraChildFee = Number(childFeeVal);
        payload.extraKidFeeOverride = Number(childFeeVal);
        payload.extraKidFee = Number(childFeeVal);
      }

      const res = await adminAPI.updateCustomRates(id, payload);
      message.success(res.message || "Custom rates updated successfully!");
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

  const handleTopBlockDates = async () => {
    if (selectedCustomDates && selectedCustomDates.length > 1) {
      await handleBlockCustomDates();
      return;
    }

    const effectiveRange =
      customRateRange &&
      customRateRange.length === 2 &&
      customRateRange[0] &&
      customRateRange[1]
        ? customRateRange
        : selectionRange &&
          selectionRange.length === 2 &&
          selectionRange[0] &&
          selectionRange[1]
        ? selectionRange
        : selectedDate
        ? [selectedDate, selectedDate]
        : null;

    if (!effectiveRange || !effectiveRange[0] || !effectiveRange[1]) {
      message.warning(
        "Please select a date range or click a date on the calendar first."
      );
      return;
    }
    const start = dayjs(effectiveRange[0]);
    const end = dayjs(effectiveRange[1]);
    try {
      setActionLoading(true);
      const targetRooms = propertyRooms
        .slice(0, topRoomCount)
        .map((r) => r.rawName);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        ...(topRoomCount >= totalInventory
          ? { roomId: "ALL" }
          : { rooms: targetRooms }),
        reason: customRateReason || "Host blocked rooms",
      };
      const res = await adminAPI.blockPropertyDates(id, payload);
      message.success(
        res.message || `Blocked ${topRoomCount} room(s) for selected dates!`
      );
      fetchData();
    } catch (err) {
      console.error("Error blocking dates:", err);
      message.error(err.message || "Failed to block dates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTopReleaseDates = async () => {
    if (selectedCustomDates && selectedCustomDates.length > 1) {
      await handleReleaseCustomDates();
      return;
    }
    const effectiveRange =
      customRateRange &&
      customRateRange.length === 2 &&
      customRateRange[0] &&
      customRateRange[1]
        ? customRateRange
        : selectionRange &&
          selectionRange.length === 2 &&
          selectionRange[0] &&
          selectionRange[1]
        ? selectionRange
        : selectedDate
        ? [selectedDate, selectedDate]
        : null;

    if (!effectiveRange || !effectiveRange[0] || !effectiveRange[1]) {
      message.warning(
        "Please select a date range or click a date on the calendar first."
      );
      return;
    }
    const start = dayjs(effectiveRange[0]);
    const end = dayjs(effectiveRange[1]);
    try {
      setActionLoading(true);
      const targetRooms = propertyRooms
        .slice(0, topRoomCount)
        .map((r) => r.rawName);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        ...(topRoomCount >= totalInventory
          ? { roomId: "ALL" }
          : { rooms: targetRooms }),
      };
      const res = await adminAPI.releasePropertyDates(id, payload);
      message.success(
        res.message || `Released ${topRoomCount} room(s) for selected dates!`
      );
      fetchData();
    } catch (err) {
      console.error("Error releasing dates:", err);
      message.error(err.message || "Failed to release dates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSingleDateCustomRate = async () => {
    if (!selectedDate) {
      message.warning("Please select a date on the calendar first.");
      return;
    }
    if (
      (singleDateCustomPrice === "" || singleDateCustomPrice === undefined) &&
      (singleDateExtraAdultPrice === "" ||
        singleDateExtraAdultPrice === undefined) &&
      (singleDateExtraChildPrice === "" ||
        singleDateExtraChildPrice === undefined)
    ) {
      message.warning(
        "Please enter at least one rate or fee override to save."
      );
      return;
    }
    const dateStr = selectedDate.format("YYYY-MM-DD");
    try {
      setActionLoading(true);
      const payload = {
        startDate: dateStr,
        endDate: dateStr,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        reason: "Single date rate update",
      };
      if (
        singleDateCustomPrice !== "" &&
        singleDateCustomPrice !== undefined &&
        !isNaN(Number(singleDateCustomPrice))
      ) {
        payload.priceOverride = Number(singleDateCustomPrice);
      }
      if (
        singleDateExtraAdultPrice !== "" &&
        singleDateExtraAdultPrice !== undefined &&
        !isNaN(Number(singleDateExtraAdultPrice))
      ) {
        payload.extraAdultFeeOverride = Number(singleDateExtraAdultPrice);
        payload.extraAdultFee = Number(singleDateExtraAdultPrice);
      }
      if (
        singleDateExtraChildPrice !== "" &&
        singleDateExtraChildPrice !== undefined &&
        !isNaN(Number(singleDateExtraChildPrice))
      ) {
        payload.extraChildFeeOverride = Number(singleDateExtraChildPrice);
        payload.extraChildFee = Number(singleDateExtraChildPrice);
        payload.extraKidFeeOverride = Number(singleDateExtraChildPrice);
        payload.extraKidFee = Number(singleDateExtraChildPrice);
      }
      const res = await adminAPI.updateCustomRates(id, payload);
      message.success(res.message || "Single date rates and fees updated!");
      setSingleDateCustomPrice("");
      setSingleDateExtraAdultPrice("");
      setSingleDateExtraChildPrice("");
      fetchData();
    } catch (err) {
      console.error("Error updating single date rate:", err);
      message.error(err.message || "Failed to update date rate.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearSingleDateCustomRates = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    try {
      setActionLoading(true);
      const payload = {
        startDate: dateStr,
        endDate: dateStr,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        priceOverride: null,
        extraAdultFeeOverride: null,
        extraChildFeeOverride: null,
        reason: "Reset custom rates to base",
      };
      const res = await adminAPI.updateCustomRates(id, payload);
      message.success(res.message || "Custom rates and fees reset to base!");
      setSingleDateCustomPrice("");
      setSingleDateExtraAdultPrice("");
      setSingleDateExtraChildPrice("");
      fetchData();
    } catch (err) {
      console.error("Error clearing custom rates:", err);
      message.error(err.message || "Failed to reset custom rates.");
    } finally {
      setActionLoading(false);
    }
  };

  // Group all availability records by date key YYYY-MM-DD
  const dateAvailabilitiesMap = React.useMemo(() => {
    const map = new Map();
    availabilities.forEach((item) => {
      const dateKey = item.dateStr || dayjs(item.date).format("YYYY-MM-DD");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(item);
    });
    return map;
  }, [availabilities]);

  // Map for fast lookup by YYYY-MM-DD (prefers global record or first blocked record)
  const availabilityMap = React.useMemo(() => {
    const map = new Map();
    dateAvailabilitiesMap.forEach((items, dateKey) => {
      const globalRec = items.find((i) => !i.roomId || i.roomId === "ALL");
      map.set(dateKey, globalRec || items[0]);
    });
    return map;
  }, [dateAvailabilitiesMap]);

  const blockedCustomDatesCount = React.useMemo(() => {
    return selectedCustomDates.filter((dStr) => {
      const records = dateAvailabilitiesMap.get(dStr) || [];
      return records.some((r) => r.isBlocked);
    }).length;
  }, [selectedCustomDates, dateAvailabilitiesMap]);

  const getRecordsForDate = (dateStr) => {
    return dateAvailabilitiesMap.get(dateStr) || [];
  };

  const isGloballyBlocked = (dateStr) => {
    const recs = getRecordsForDate(dateStr);
    return recs.some(
      (r) => (!r.roomId || r.roomId === "ALL") && (r.isBlocked || !!r.bookingId)
    );
  };

  const isRoomBlockedOnDate = (dateStr, roomId) => {
    if (isGloballyBlocked(dateStr)) return true;
    const recs = getRecordsForDate(dateStr);
    return recs.some(
      (r) => r.roomId === roomId && (r.isBlocked || !!r.bookingId)
    );
  };

  const getBlockedRoomsList = (dateStr) => {
    if (isGloballyBlocked(dateStr)) {
      return propertyRooms.map((r) => r.rawName);
    }
    const recs = getRecordsForDate(dateStr);
    const blocked = new Set();
    recs.forEach((r) => {
      if (r.roomId && (r.isBlocked || !!r.bookingId)) {
        blocked.add(r.roomId);
      }
    });
    return Array.from(blocked);
  };

  const getUsedRoomsCount = (dateStr) => {
    if (isGloballyBlocked(dateStr)) {
      return totalInventory;
    }
    const recs = getRecordsForDate(dateStr);
    const blocked = new Set();
    recs.forEach((r) => {
      if (r.isBlocked || !!r.bookingId) {
        if (!r.roomId || r.roomId === "ALL") {
          for (let i = 0; i < totalInventory; i++) {
            blocked.add(propertyRooms[i]?.rawName || `room-${i + 1}`);
          }
        } else {
          blocked.add(r.roomId);
        }
      }
    });
    return Math.min(blocked.size, totalInventory);
  };

  const getAvailableRoomsCount = (dateStr) => {
    const total = totalInventory;
    const used = getUsedRoomsCount(dateStr);
    return Math.max(0, total - used);
  };

  const handleSingleDateIncreaseBlocked = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    // Find first unblocked room
    const unblockedRoom = propertyRooms.find(
      (r) => !isRoomBlockedOnDate(dateStr, r.rawName)
    );
    if (!unblockedRoom) {
      message.info("All rooms are already blocked for this date.");
      return;
    }
    await handleToggleRoomBlock(unblockedRoom.rawName, false);
  };

  const handleSingleDateDecreaseBlocked = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    if (isGloballyBlocked(dateStr)) {
      try {
        setActionLoading(true);
        await adminAPI.releasePropertyDates(id, { dates: [dateStr] });
        if (totalInventory > 1) {
          const remainingRooms = propertyRooms
            .slice(0, totalInventory - 1)
            .map((r) => r.rawName);
          await adminAPI.blockPropertyDates(id, {
            dates: [dateStr],
            rooms: remainingRooms,
            reason: "Admin room block",
          });
        }
        message.success(`Released 1 room for ${dateStr}`);
        fetchData();
      } catch (err) {
        console.error("Error decreasing blocked rooms:", err);
        message.error(err.message || "Failed to release room.");
      } finally {
        setActionLoading(false);
      }
      return;
    }
    const blockedList = getBlockedRoomsList(dateStr);
    if (blockedList.length === 0) {
      message.info("No rooms are currently blocked for this date.");
      return;
    }
    const lastBlockedRawName = blockedList[blockedList.length - 1];
    await handleToggleRoomBlock(lastBlockedRawName, true);
  };

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

  // Window-level mouseup listener for Airbnb-style drag selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isShiftSelectingRef.current) {
        return;
      }
      if (isMouseDownRef.current) {
        const wasDragging = isDraggingRef.current;
        const anchor = dragAnchorRef.current;
        isMouseDownRef.current = false;
        dragAnchorRef.current = null;
        isDraggingRef.current = false;
        setIsMouseDown(false);

        if (
          wasDragging &&
          selectionRange &&
          selectionRange[0] &&
          selectionRange[1] &&
          !selectionRange[0].isSame(selectionRange[1], "day")
        ) {
          const [start, end] = selectionRange;
          setSelectedDate(start);
          setCustomRateRange([start, end]);
          setBlockRange([start, end]);
          setReleaseRange([start, end]);
          setIsDrawerOpen(true);
        } else if (anchor) {
          handleSelectDate(anchor);
        }
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [selectionRange]);

  // Prepopulate single date drawer fields when a single date is selected
  useEffect(() => {
    if (isDrawerOpen && selectedDate && !isMultiDayRange) {
      const dStr = selectedDate.format("YYYY-MM-DD");
      const dateRecords = getRecordsForDate(dStr);
      const rateRec =
        dateRecords.find(
          (r) =>
            (r.priceOverride !== undefined && r.priceOverride !== null) ||
            (r.extraAdultFeeOverride !== undefined &&
              r.extraAdultFeeOverride !== null) ||
            (r.extraChildFeeOverride !== undefined &&
              r.extraChildFeeOverride !== null)
        ) ||
        dateRecords.find((r) => !r.roomId || r.roomId === "ALL") ||
        availabilityMap.get(dStr);

      if (rateRec) {
        setSingleDateCustomPrice(
          rateRec.priceOverride !== undefined && rateRec.priceOverride !== null
            ? String(rateRec.priceOverride)
            : ""
        );
        setSingleDateExtraAdultPrice(
          rateRec.extraAdultFeeOverride !== undefined &&
            rateRec.extraAdultFeeOverride !== null
            ? String(rateRec.extraAdultFeeOverride)
            : ""
        );
        setSingleDateExtraChildPrice(
          rateRec.extraChildFeeOverride !== undefined &&
            rateRec.extraChildFeeOverride !== null
            ? String(rateRec.extraChildFeeOverride)
            : ""
        );
      } else {
        setSingleDateCustomPrice("");
        setSingleDateExtraAdultPrice("");
        setSingleDateExtraChildPrice("");
      }
    }
  }, [isDrawerOpen, selectedDate, isMultiDayRange, availabilities]);

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
  const handleReleaseSingleDate = async (item, targetRoomId) => {
    try {
      setActionLoading(true);
      const payload = {
        dates: [
          item?.dateStr ||
            (item?.date
              ? dayjs(item.date).format("YYYY-MM-DD")
              : selectedDate.format("YYYY-MM-DD")),
        ],
        roomId:
          targetRoomId !== undefined
            ? targetRoomId === "ALL"
              ? undefined
              : targetRoomId
            : item?.roomId || undefined,
        bookingId: item?.bookingId || undefined,
        cancelBooking: !!item?.bookingId,
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

  // Toggle block/release on an individual room for the single selected date
  const handleToggleRoomBlock = async (roomRawName, isCurrentlyBlocked) => {
    if (!selectedDate) return;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    try {
      setActionLoading(true);
      if (isCurrentlyBlocked) {
        await adminAPI.releasePropertyDates(id, {
          dates: [dateStr],
          roomId: roomRawName,
        });
        message.success(`Released ${roomRawName} for ${dateStr}`);
      } else {
        await adminAPI.blockPropertyDates(id, {
          dates: [dateStr],
          roomId: roomRawName,
          reason: "Admin manual room block",
        });
        message.success(`Blocked ${roomRawName} for ${dateStr}`);
      }
      fetchData();
    } catch (err) {
      console.error("Error toggling room block:", err);
      message.error(err.message || "Failed to update room availability.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockAllRoomsSingleDate = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    try {
      setActionLoading(true);
      await adminAPI.blockPropertyDates(id, {
        dates: [dateStr],
        reason: "Admin blocked all rooms",
      });
      message.success(`All rooms blocked for ${dateStr}`);
      fetchData();
    } catch (err) {
      console.error("Error blocking all rooms:", err);
      message.error(err.message || "Failed to block all rooms.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseAllRoomsSingleDate = async () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    try {
      setActionLoading(true);
      await adminAPI.releasePropertyDates(id, {
        dates: [dateStr],
      });
      message.success(`All rooms released for ${dateStr}`);
      fetchData();
    } catch (err) {
      console.error("Error releasing all rooms:", err);
      message.error(err.message || "Failed to release all rooms.");
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
      const targetRooms = propertyRooms
        .slice(0, sidebarReleaseRoomCount)
        .map((r) => r.rawName);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        ...(sidebarReleaseRoomCount >= totalInventory
          ? { roomId: "ALL" }
          : { rooms: targetRooms }),
      };
      const res = await adminAPI.releasePropertyDates(id, payload);
      message.success(
        res.message ||
          `Released ${sidebarReleaseRoomCount} room(s) for selected range!`
      );
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
      const targetRooms = propertyRooms
        .slice(0, sidebarBlockRoomCount)
        .map((r) => r.rawName);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        ...(sidebarBlockRoomCount >= totalInventory
          ? { roomId: "ALL" }
          : { rooms: targetRooms }),
        reason: blockReason || "Admin manual block",
      };
      const res = await adminAPI.blockPropertyDates(id, payload);
      message.success(
        res.message ||
          `Blocked ${sidebarBlockRoomCount} room(s) for selected range!`
      );
      setBlockRange(null);
      fetchData();
    } catch (err) {
      console.error("Error blocking range:", err);
      message.error(err.message || "Failed to block date range.");
    } finally {
      setActionLoading(false);
    }
  };

  // Drag-to-Select & Shift+Click Multi-Date Selection Handlers
  const handleCellMouseDown = (current, e) => {
    if (e.button !== 0) return; // only left click

    const isModifier = e.shiftKey || e.ctrlKey || e.metaKey;
    const currentStr = current.format("YYYY-MM-DD");

    if (isModifier) {
      e.preventDefault();
      e.stopPropagation();
      isShiftSelectingRef.current = true;
      setTimeout(() => {
        isShiftSelectingRef.current = false;
      }, 250);

      setSelectedCustomDates((prev) => {
        let next;
        if (prev.includes(currentStr)) {
          next = prev.filter((d) => d !== currentStr);
        } else {
          const base =
            prev.length > 0
              ? prev
              : selectedDate
              ? [selectedDate.format("YYYY-MM-DD")]
              : [];
          next = base.includes(currentStr) ? base : [...base, currentStr];
        }
        return [...new Set(next)].sort();
      });

      setSelectedDate(current);
      setSelectionRange(null);
      setCustomRateRange(null);
      setBlockRange(null);
      setReleaseRange(null);
      setIsDrawerOpen(true);
      return;
    }

    isMouseDownRef.current = true;
    dragAnchorRef.current = current;
    shiftAnchorRef.current = current;
    isDraggingRef.current = false;
    setIsMouseDown(true);
    setDragAnchor(current);

    setSelectedCustomDates([currentStr]);
    setSelectedDate(current);
    setSelectionRange([current, current]);
  };

  const handleCellMouseEnter = (current) => {
    if (!isMouseDownRef.current || !dragAnchorRef.current) return;
    if (!current.isSame(dragAnchorRef.current, "day")) {
      isDraggingRef.current = true;
    }
    const anchor = dragAnchorRef.current;
    const start = current.isBefore(anchor, "day") ? current : anchor;
    const end = current.isBefore(anchor, "day") ? anchor : current;
    setSelectionRange([start, end]);
  };

  // Discrete Multi-Date Handlers (Shift+Click selected dates)
  const handleApplyCustomDatesRates = async () => {
    if (!selectedCustomDates || selectedCustomDates.length === 0) return;
    const priceVal =
      customPriceOverride !== "" ? customPriceOverride : customRateInput;
    const adultFeeVal = customExtraAdultFeeInput;
    const childFeeVal = customExtraChildFeeInput;

    try {
      setActionLoading(true);
      const payload = {
        dates: selectedCustomDates,
        reason: customRateReason || "Custom rate for selected dates",
      };
      if (
        priceVal !== "" &&
        priceVal !== undefined &&
        !isNaN(Number(priceVal))
      ) {
        payload.priceOverride = Number(priceVal);
        payload.price = Number(priceVal);
      }
      if (
        adultFeeVal !== "" &&
        adultFeeVal !== undefined &&
        !isNaN(Number(adultFeeVal))
      ) {
        payload.extraAdultFeeOverride = Number(adultFeeVal);
        payload.extraAdultFee = Number(adultFeeVal);
      }
      if (
        childFeeVal !== "" &&
        childFeeVal !== undefined &&
        !isNaN(Number(childFeeVal))
      ) {
        payload.extraChildFeeOverride = Number(childFeeVal);
        payload.extraChildFee = Number(childFeeVal);
        payload.extraKidFeeOverride = Number(childFeeVal);
        payload.extraKidFee = Number(childFeeVal);
      }

      const res = await adminAPI.updateCustomRates(id, payload);
      message.success(
        res.message ||
          `Custom rates updated for ${selectedCustomDates.length} selected date(s)!`
      );
      setCustomPriceOverride("");
      setCustomRateInput("");
      setCustomExtraAdultFeeInput("");
      setCustomExtraChildFeeInput("");
      fetchData();
    } catch (err) {
      console.error("Error updating custom rates for selected dates:", err);
      message.error(err.message || "Failed to update custom rates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockCustomDates = async () => {
    if (!selectedCustomDates || selectedCustomDates.length === 0) return;
    try {
      setActionLoading(true);
      const targetRooms = propertyRooms
        .slice(0, drawerRoomCount)
        .map((r) => r.rawName);
      const payload = {
        dates: selectedCustomDates,
        ...(drawerRoomCount >= totalInventory
          ? { roomId: "ALL" }
          : { rooms: targetRooms }),
        reason: blockReason || "Admin manual block",
      };
      const res = await adminAPI.blockPropertyDates(id, payload);
      message.success(
        res.message || `Blocked ${selectedCustomDates.length} selected date(s)!`
      );
      fetchData();
    } catch (err) {
      console.error("Error blocking selected dates:", err);
      message.error(err.message || "Failed to block selected dates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseCustomDates = async () => {
    if (!selectedCustomDates || selectedCustomDates.length === 0) return;
    try {
      setActionLoading(true);
      const targetRooms = propertyRooms
        .slice(0, sidebarReleaseRoomCount)
        .map((r) => r.rawName);
      const payload = {
        dates: selectedCustomDates,
        ...(sidebarReleaseRoomCount >= totalInventory
          ? { roomId: "ALL" }
          : { rooms: targetRooms }),
      };
      const res = await adminAPI.releasePropertyDates(id, payload);
      message.success(
        res.message ||
          `Released ${selectedCustomDates.length} selected date(s)!`
      );
      fetchData();
    } catch (err) {
      console.error("Error releasing selected dates:", err);
      message.error(err.message || "Failed to release selected dates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetCustomDatesRates = async () => {
    if (!selectedCustomDates || selectedCustomDates.length === 0) return;
    try {
      setActionLoading(true);
      const payload = {
        dates: selectedCustomDates,
        priceOverride: null,
        extraAdultFeeOverride: null,
        extraChildFeeOverride: null,
        reason: "Reset custom rates to base",
      };
      const res = await adminAPI.updateCustomRates(id, payload);
      message.success(
        res.message ||
          `Reset rates to base for ${selectedCustomDates.length} selected date(s)!`
      );
      fetchData();
    } catch (err) {
      console.error("Error resetting rates:", err);
      message.error(err.message || "Failed to reset rates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveCustomDate = (dateStr) => {
    setSelectedCustomDates((prev) => prev.filter((d) => d !== dateStr));
  };

  const handleClearCustomDates = () => {
    setSelectedCustomDates([]);
    setSelectionRange(null);
  };

  // Range Actions Handlers
  const handleBlockSelectedRange = async () => {
    if (!selectionRange || !selectionRange[0] || !selectionRange[1]) return;
    try {
      setActionLoading(true);
      const targetRooms = propertyRooms
        .slice(0, drawerRoomCount)
        .map((r) => r.rawName);
      const payload = {
        startDate: selectionRange[0].format("YYYY-MM-DD"),
        endDate: selectionRange[1].format("YYYY-MM-DD"),
        ...(drawerRoomCount >= totalInventory
          ? { roomId: "ALL" }
          : { rooms: targetRooms }),
        reason: blockReason || "Admin manual block",
      };
      const res = await adminAPI.blockPropertyDates(id, payload);
      message.success(
        res.message || `Blocked ${drawerRoomCount} room(s) for selected range!`
      );
      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error blocking range:", err);
      message.error(err.message || "Failed to block date range.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseSelectedRange = async () => {
    if (!selectionRange || !selectionRange[0] || !selectionRange[1]) return;
    try {
      setActionLoading(true);
      const targetRooms = propertyRooms
        .slice(0, drawerRoomCount)
        .map((r) => r.rawName);
      const payload = {
        startDate: selectionRange[0].format("YYYY-MM-DD"),
        endDate: selectionRange[1].format("YYYY-MM-DD"),
        ...(drawerRoomCount >= totalInventory
          ? { roomId: "ALL" }
          : { rooms: targetRooms }),
      };
      const res = await adminAPI.releasePropertyDates(id, payload);
      message.success(
        res.message || `Released ${drawerRoomCount} room(s) for selected range!`
      );
      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error releasing range:", err);
      message.error(err.message || "Failed to release date range.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRangeCustomRate = async () => {
    if (!selectionRange || !selectionRange[0] || !selectionRange[1]) {
      message.warning("Please select a date range on the calendar first.");
      return;
    }
    const hasPrice =
      rangeCustomPrice !== "" &&
      rangeCustomPrice !== undefined &&
      !isNaN(Number(rangeCustomPrice));
    const hasExtraAdult =
      rangeExtraAdultPrice !== "" &&
      rangeExtraAdultPrice !== undefined &&
      !isNaN(Number(rangeExtraAdultPrice));
    const hasExtraChild =
      rangeExtraChildPrice !== "" &&
      rangeExtraChildPrice !== undefined &&
      !isNaN(Number(rangeExtraChildPrice));

    if (!hasPrice && !hasExtraAdult && !hasExtraChild) {
      message.warning(
        "Please enter at least one rate or fee override to save."
      );
      return;
    }

    const start = dayjs(selectionRange[0]);
    const end = dayjs(selectionRange[1]);

    try {
      setActionLoading(true);
      const payload = {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        reason: "Range rate update",
      };
      if (hasPrice) {
        payload.priceOverride = Number(rangeCustomPrice);
      }
      if (hasExtraAdult) {
        payload.extraAdultFeeOverride = Number(rangeExtraAdultPrice);
        payload.extraAdultFee = Number(rangeExtraAdultPrice);
      }
      if (hasExtraChild) {
        payload.extraChildFeeOverride = Number(rangeExtraChildPrice);
        payload.extraChildFee = Number(rangeExtraChildPrice);
        payload.extraKidFeeOverride = Number(rangeExtraChildPrice);
        payload.extraKidFee = Number(rangeExtraChildPrice);
      }

      const res = await adminAPI.updateCustomRates(id, payload);
      message.success(res.message || "Rates updated for selected range!");
      setRangeCustomPrice("");
      setRangeExtraAdultPrice("");
      setRangeExtraChildPrice("");
      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error updating range rates:", err);
      message.error(err.message || "Failed to update rates.");
    } finally {
      setActionLoading(false);
    }
  };

  let blockedInRangeCount = 0;
  if (isMultiDayRange) {
    let curr = selectionRange[0].clone();
    const endStr = selectionRange[1].format("YYYY-MM-DD");
    while (curr.format("YYYY-MM-DD") <= endStr) {
      const dStr = curr.format("YYYY-MM-DD");
      if (availabilityMap.get(dStr)?.isBlocked) {
        blockedInRangeCount++;
      }
      curr = curr.add(1, "day");
    }
  }

  // Render Full Calendar Cell (Airbnb Drag-to-Select styling)
  const fullCellRender = (current, info) => {
    if (info.type !== "date") return info.originNode;

    const dateStr = current.format("YYYY-MM-DD");
    const isToday = current.isSame(dayjs(), "day");

    const hasRange = selectionRange && selectionRange[0] && selectionRange[1];
    const startStr = hasRange ? selectionRange[0].format("YYYY-MM-DD") : null;
    const endStr = hasRange ? selectionRange[1].format("YYYY-MM-DD") : null;

    const isRangeStart = hasRange && dateStr === startStr;
    const isRangeEnd = hasRange && dateStr === endStr;
    const isInRange = hasRange && dateStr >= startStr && dateStr <= endStr;
    const isMultiDay = hasRange && startStr !== endStr;
    const isCustomSelected = selectedCustomDates.includes(dateStr);
    const isSingleSelected =
      !isCustomSelected &&
      (!hasRange || !isMultiDay) &&
      selectedDate &&
      current.isSame(selectedDate, "day");

    const dayRecords = getRecordsForDate(dateStr);
    const isGlobalBlocked = isGloballyBlocked(dateStr);
    const blockedRooms = getBlockedRoomsList(dateStr);
    const totalRoomsCount = totalInventory;
    const usedRoomsCount = getUsedRoomsCount(dateStr);
    const areAllRoomsBlocked =
      isGlobalBlocked ||
      (totalRoomsCount > 0 && usedRoomsCount >= totalRoomsCount);
    const isPartiallyBlocked =
      totalRoomsCount > 0 &&
      usedRoomsCount > 0 &&
      usedRoomsCount < totalRoomsCount &&
      !isGlobalBlocked;

    const isBooking = dayRecords.some(
      (r) => r.source === "BOOKING" || !!r.bookingId
    );
    const isICal = dayRecords.some((r) => r.source === "ICAL_SYNC");
    const hasOverride = dayRecords.some(
      (r) =>
        (typeof r.priceOverride === "number" && r.priceOverride > 0) ||
        (typeof r.extraAdultFeeOverride === "number" &&
          r.extraAdultFeeOverride > 0) ||
        (typeof r.extraChildFeeOverride === "number" &&
          r.extraChildFeeOverride > 0)
    );

    const priceOverrideItem = dayRecords.find(
      (r) => typeof r.priceOverride === "number" && r.priceOverride > 0
    );
    const dailyPrice =
      priceOverrideItem?.priceOverride || property?.pricePerNight || 0;
    const priceText = formatPriceK(dailyPrice);

    const adultFeeItem = dayRecords.find(
      (r) =>
        typeof r.extraAdultFeeOverride === "number" &&
        r.extraAdultFeeOverride >= 0
    );
    const childFeeItem = dayRecords.find(
      (r) =>
        typeof r.extraChildFeeOverride === "number" &&
        r.extraChildFeeOverride >= 0
    );

    const cellAdultFee =
      adultFeeItem?.extraAdultFeeOverride !== undefined
        ? adultFeeItem.extraAdultFeeOverride
        : property?.extraAdultFee ?? 0;

    const cellChildFee =
      childFeeItem?.extraChildFeeOverride !== undefined
        ? childFeeItem.extraChildFeeOverride
        : property?.extraChildFee ?? 0;

    const hasCustomAdultFeeCell =
      adultFeeItem?.extraAdultFeeOverride !== undefined;
    const hasCustomChildFeeCell =
      childFeeItem?.extraChildFeeOverride !== undefined;

    return (
      <div
        onMouseDown={(e) => handleCellMouseDown(current, e)}
        onMouseEnter={() => handleCellMouseEnter(current)}
        onClick={(e) => {
          if (
            e.shiftKey ||
            e.ctrlKey ||
            e.metaKey ||
            isShiftSelectingRef.current
          ) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          handleSelectDate(current);
        }}
        className={`h-full w-full p-1.5 flex flex-col shrink-0 justify-between transition-all border cursor-pointer select-none min-h-[90px] ${
          isCustomSelected
            ? "bg-amber-500/25 border-2 border-amber-500 text-slate-900 shadow-sm rounded-2xl ring-2 ring-amber-400/40 ring-offset-1 z-10"
            : isMultiDay && isInRange
            ? isRangeStart
              ? "bg-amber-500/20 border-amber-500 border-2 rounded-l-2xl rounded-r-none z-10 shadow-sm"
              : isRangeEnd
              ? "bg-amber-500/20 border-amber-500 border-2 rounded-r-2xl rounded-l-none z-10 shadow-sm"
              : "bg-amber-500/15 border-y-2 border-amber-400 border-x-0 rounded-none"
            : isSingleSelected || (isRangeStart && !isMultiDay)
            ? "bg-amber-500/15 border-2 border-amber-500 text-slate-900 shadow-sm rounded-2xl"
            : areAllRoomsBlocked
            ? "bg-slate-100/90 border-slate-200 text-slate-400 rounded-2xl"
            : isPartiallyBlocked
            ? "bg-amber-50/60 border-amber-300/80 hover:border-amber-400 hover:shadow-xs text-slate-900 rounded-2xl"
            : "bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-xs text-slate-900 rounded-2xl"
        }`}
      >
        {/* Top Bar: Date Number Badge & Range Markers */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                isCustomSelected
                  ? "bg-amber-600 text-white shadow-xs font-black ring-2 ring-amber-200"
                  : isRangeStart || isRangeEnd
                  ? "bg-amber-600 text-white shadow-xs font-black"
                  : isToday
                  ? "bg-rose-500 text-white shadow-xs"
                  : isInRange
                  ? "text-amber-950 font-black bg-amber-200/80"
                  : areAllRoomsBlocked
                  ? "line-through text-slate-400 font-semibold"
                  : "text-slate-900 font-bold"
              }`}
            >
              {current.date()}
            </span>

            {isCustomSelected && selectedCustomDates.length > 1 && (
              <span className="text-[9px] font-extrabold text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded-md border border-amber-300">
                Selected
              </span>
            )}
            {isRangeStart && isMultiDay && (
              <span className="text-[9px] font-extrabold text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded-md border border-amber-300">
                Start
              </span>
            )}
            {isRangeEnd && isMultiDay && (
              <span className="text-[9px] font-extrabold text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded-md border border-amber-300">
                End
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {usedRoomsCount > 0 && !areAllRoomsBlocked && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${
                  usedRoomsCount >= totalRoomsCount
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}
                title={`${usedRoomsCount} of ${totalRoomsCount} rooms used`}
              >
                <BedDouble className="w-2.5 h-2.5" />
                <span>
                  {usedRoomsCount}/{totalRoomsCount} Used
                </span>
              </span>
            )}

            {isBooking && (
              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <User className="w-2.5 h-2.5" />
                <span>Booked</span>
              </span>
            )}
            {isICal && !isBooking && (
              <span className="bg-sky-100 text-sky-800 border border-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Globe className="w-2.5 h-2.5" />
                <span>iCal</span>
              </span>
            )}
            {hasOverride && !areAllRoomsBlocked && !isBooking && !isICal && (
              <span
                className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                title="Custom Rate Override Active"
              >
                <span>₹ Custom</span>
              </span>
            )}
            {areAllRoomsBlocked && !isBooking && !isICal && (
              <span className="bg-slate-200 text-slate-600 text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                <span>{isRoomBased ? "All Blocked" : "Blocked"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Bar: Daily Nightly Price */}
        <div className="mt-1 text-center">
          <span
            className={`text-xs font-bold font-mono tracking-tight block ${
              areAllRoomsBlocked
                ? "text-slate-400 opacity-60 line-through"
                : hasOverride
                ? "text-emerald-700 font-extrabold"
                : "text-slate-800"
            }`}
          >
            {priceText}
          </span>
        </div>
        {/*<div className="flex items-center justify-center gap-1">
            <span
              className={`text-[7px] px-1.5 py-0.5 rounded-md font-normal transition-all ${
                hasCustomAdultFeeCell
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-300 shadow-2xs"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
              }`}
              title={`Extra Adult Fee: ₹${cellAdultFee} ${
                hasCustomAdultFeeCell
                  ? "(Custom Date Override)"
                  : "(Property Base Fee)"
              }`}
            >
              A-₹{cellAdultFee}
            </span>
            <span
              className={`text-[7px] px-1.5 py-0.5 rounded-md font-normal transition-all ${
                hasCustomChildFeeCell
                  ? "bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs"
                  : "bg-purple-50 text-purple-800 border border-purple-200/70"
              }`}
              title={`Extra Kid Fee: ₹${cellChildFee} ${
                hasCustomChildFeeCell
                  ? "(Custom Date Override)"
                  : "(Property Base Fee)"
              }`}
            >
              K-₹{cellChildFee}
            </span>
          </div> */}
        {/* {dayRecords[0]?.notes && (
            <span className="text-[9px] text-slate-400 block truncate max-w-full font-medium mt-0.5">
              {dayRecords[0].notes}
            </span>
          )} */}
        {/* </div> */}
      </div>
    );
  };

  const selectedDateStr = selectedDate ? selectedDate.format("YYYY-MM-DD") : "";
  const selectedAvailability = availabilityMap.get(selectedDateStr);
  const selectedDateRecords = getRecordsForDate(selectedDateStr);
  const selectedRateRecord =
    selectedDateRecords.find(
      (r) =>
        (r.priceOverride !== undefined && r.priceOverride !== null) ||
        (r.extraAdultFeeOverride !== undefined &&
          r.extraAdultFeeOverride !== null) ||
        (r.extraChildFeeOverride !== undefined &&
          r.extraChildFeeOverride !== null)
    ) ||
    selectedDateRecords.find((r) => !r.roomId || r.roomId === "ALL") ||
    selectedAvailability;

  const customNightlyPrice = selectedRateRecord?.priceOverride;
  const hasCustomPrice =
    customNightlyPrice !== undefined &&
    customNightlyPrice !== null &&
    !isNaN(Number(customNightlyPrice));
  const effectiveNightlyPrice = hasCustomPrice
    ? Number(customNightlyPrice)
    : property?.pricePerNight || 0;

  const customAdultFee = selectedRateRecord?.extraAdultFeeOverride;
  const hasCustomAdultFee =
    customAdultFee !== undefined &&
    customAdultFee !== null &&
    !isNaN(Number(customAdultFee));
  const effectiveAdultFee = hasCustomAdultFee
    ? Number(customAdultFee)
    : property?.extraAdultFee ?? 0;

  const customChildFee = selectedRateRecord?.extraChildFeeOverride;
  const hasCustomChildFee =
    customChildFee !== undefined &&
    customChildFee !== null &&
    !isNaN(Number(customChildFee));
  const effectiveChildFee = hasCustomChildFee
    ? Number(customChildFee)
    : property?.extraChildFee ?? 0;

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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {property?.title || "Property Calendar"}
              </h1>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0} / night
              </span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Total Inventory: {totalInventory}{" "}
                  {totalInventory === 1 ? "Room" : "Rooms"}
                </span>
              </span>
              {/* <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-600" />
                <span>
                  Extra Adult: ₹
                  {property?.extraAdultFee?.toLocaleString("en-IN") || 0}
                </span>
              </span>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <User className="w-3 h-3 text-purple-600" />
                <span>
                  Extra Kid: ₹
                  {property?.extraChildFee?.toLocaleString("en-IN") || 0}
                </span>
              </span>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Base Guests: {property?.baseGuests || 2} (Max:{" "}
                {property?.guestsMax || 2})
              </span> */}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-3xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shrink-0">
            <BedDouble className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-medium block truncate">
              Inventory
            </span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {totalInventory} {totalInventory === 1 ? "Room" : "Rooms"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-medium block truncate">
              Blocked Nights
            </span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {availabilities.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-medium block truncate">
              Base Nightly
            </span>
            <span className="text-base font-bold text-slate-900 font-mono">
              ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-3.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-medium block truncate">
              iCal Sync
            </span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {icalFeeds.length} Feeds
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Rates & Availability Control Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quick Rates &amp; Date Availability
              </h3>
              <p className="text-[11px] text-slate-500">
                Batch set custom nightly rates, extra guest fees, or
                block/release dates
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTopBlockDates}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shrink-0"
              title={`Block ${topRoomCount} room(s) for selected dates`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Block {topRoomCount} {topRoomCount === 1 ? "Room" : "Rooms"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleTopReleaseDates}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shrink-0"
              title={`Release ${topRoomCount} room(s) for selected dates`}
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                Release {topRoomCount} {topRoomCount === 1 ? "Room" : "Rooms"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleUpdateCustomRates}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Rates</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Range Picker */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-600">
              Date Range
            </label>
            <RangePicker
              value={customRateRange}
              onChange={setCustomRateRange}
              format="YYYY-MM-DD"
              className="w-full rounded-2xl text-xs py-2"
              placeholder={["Start Date", "End Date"]}
            />
          </div>

          {/* Room Count Stepper */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <BedDouble className="w-3 h-3 text-amber-600" />
                <span>Rooms</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Total: {totalInventory}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => setTopRoomCount((prev) => Math.max(1, prev - 1))}
                disabled={topRoomCount <= 1}
                className="w-7 h-7 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer transition-all border border-slate-200/60"
                title="Decrease room count"
              >
                <Minus className="w-3 h-3" />
              </button>
              <div className="flex-1 text-center font-bold text-xs text-slate-800 truncate">
                {topRoomCount} {topRoomCount === 1 ? "Room" : "Rooms"}
                {topRoomCount >= totalInventory && (
                  <span className="ml-1 text-[10px] text-amber-600 font-bold">
                    (All)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  setTopRoomCount((prev) => Math.min(totalInventory, prev + 1))
                }
                disabled={topRoomCount >= totalInventory}
                className="w-7 h-7 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer transition-all border border-slate-200/60"
                title="Increase room count"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Custom Rate Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">
              Nightly Rate (₹)
            </label>
            <Input
              type="number"
              placeholder={`Base: ₹${
                property?.pricePerNight?.toLocaleString("en-IN") || 0
              }`}
              value={customRateInput}
              onChange={(e) => setCustomRateInput(e.target.value)}
              className="rounded-2xl text-xs py-2 font-mono font-bold"
            />
          </div>

          {/* Extra Adult Fee Override */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">
              Extra Adult (₹)
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
            <label className="text-[11px] font-semibold text-slate-600">
              Extra Kid (₹)
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
        <div className="pt-2.5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Apply to Days:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDayOfWeek(idx)}
                    className={`text-xs px-3 py-1 rounded-full border cursor-pointer select-none transition-all ${
                      daysOfWeek.includes(idx)
                        ? "bg-slate-900 text-white border-slate-900 font-bold shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {day}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDaysOfWeek([0, 1, 2, 3, 4, 5, 6])}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer underline"
            >
              All Days
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setDaysOfWeek([1, 2, 3, 4, 5])}
              className="text-[11px] text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Weekdays
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setDaysOfWeek([0, 6])}
              className="text-[11px] text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Weekends
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Full-Page Calendar + iCal Sync Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
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
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shadow-2xs">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 bg-white border border-slate-300 rounded shadow-2xs">
                  Shift
                </kbd>
                <span>+ Click for multi-select (e.g. 7th, 14th, 19th)</span>
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
            <div className="custom-full-calendar select-none">
              {/* Discrete Multi-Date Selection Banner */}
              {isMultiCustomDates && !isMultiDayRange && (
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {selectedCustomDates.length}D
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{selectedCustomDates.length} Dates Selected</span>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                          {selectedCustomDates
                            .map((d) => dayjs(d).format("DD MMM"))
                            .slice(0, 5)
                            .join(", ")}
                          {selectedCustomDates.length > 5
                            ? ` +${selectedCustomDates.length - 5} more`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1"
                    >
                      {/* <Sparkles className="w-3 h-3" /> */}
                      <span>Manage Rates</span>
                    </button>
                    {/* <button
                      type="button"
                      onClick={handleBlockCustomDates}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Block</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleReleaseCustomDates}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Release</span>
                    </button>*/}
                    <button
                      type="button"
                      onClick={handleClearCustomDates}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-all cursor-pointer"
                      title="Clear selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Airbnb Style Drag Range Selection Banner */}
              {isMultiDayRange && (
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {nightsCount}N
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>
                          {selectionRange[0].format("DD MMM YYYY")} &ndash;{" "}
                          {selectionRange[1].format("DD MMM YYYY")}
                        </span>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                          {nightsCount} Nights Selected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Manage Rates</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectionRange(null);
                        setDragAnchor(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-all cursor-pointer"
                      title="Clear selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

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
                onSelect={(date) => {
                  if (
                    isShiftSelectingRef.current ||
                    isDraggingRef.current ||
                    selectedCustomDates.length > 1
                  ) {
                    return;
                  }
                  handleSelectDate(date);
                }}
              />
            </div>
          )}
        </div>

        {/* Right 1 Col: iCal Sync Settings & Feeds */}
        <div className="space-y-6">
          {/* Live Active Selection Inspector */}
          {isMultiCustomDates ? (
            /* Multi-Date Active Selection Inspector */
            <div className="bg-white border border-amber-300/80 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-1">
                    {selectedCustomDates.length} Dates Selected
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Multi-Date Custom Selection
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomDates}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selected Dates Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Selected Dates ({selectedCustomDates.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {selectedCustomDates.map((dStr) => (
                    <span
                      key={dStr}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold"
                    >
                      <span>{dayjs(dStr).format("DD MMM")}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomDate(dStr)}
                        className="hover:text-red-600 cursor-pointer"
                        title="Remove date"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status overview */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Nightly:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0}
                    /night
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Extra Adult / Kid:</span>
                  <span className="font-medium text-slate-700 font-mono">
                    ₹{property?.extraAdultFee || 0} / ₹
                    {property?.extraChildFee || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Currently Blocked:</span>
                  <span className="font-bold text-slate-800">
                    {blockedCustomDatesCount} of {selectedCustomDates.length}{" "}
                    dates
                  </span>
                </div>
              </div>

              {/* Room Count Stepper (if totalInventory > 1) */}
              {totalInventory > 1 && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/70 rounded-2xl p-2 px-3">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                    <span>Target Rooms:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDrawerRoomCount((prev) => Math.max(1, prev - 1))
                      }
                      disabled={drawerRoomCount <= 1}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-40 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs text-slate-800 min-w-16 text-center">
                      {drawerRoomCount}{" "}
                      {drawerRoomCount === 1 ? "Room" : "Rooms"}
                      {drawerRoomCount >= totalInventory ? " (All)" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDrawerRoomCount((prev) =>
                          Math.min(totalInventory, prev + 1)
                        )
                      }
                      disabled={drawerRoomCount >= totalInventory}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-40 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Manage Rates in Drawer</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleBlockCustomDates}
                    disabled={actionLoading}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Block Dates</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReleaseCustomDates}
                    disabled={actionLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Release Dates</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isMultiDayRange ? (
            /* Multi-Day Range Active Inspector */
            <div className="bg-white border border-amber-300/80 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-1">
                    {nightsCount} Nights Selected
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectionRange[0].format("DD MMM")} –{" "}
                    {selectionRange[1].format("DD MMM YYYY")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionRange(null);
                    setDragAnchor(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  title="Deselect range"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status overview */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Rate:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0}
                    /night
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Extra Adult / Kid:</span>
                  <span className="font-medium text-slate-700 font-mono">
                    ₹{property?.extraAdultFee || 0} / ₹
                    {property?.extraChildFee || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Currently Blocked:</span>
                  <span className="font-bold text-slate-800">
                    {blockedInRangeCount} of {nightsCount} nights
                  </span>
                </div>
              </div>

              {/* Room Count Stepper (if totalInventory > 1) */}
              {totalInventory > 1 && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/70 rounded-2xl p-2 px-3">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                    <span>Target Rooms:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDrawerRoomCount((prev) => Math.max(1, prev - 1))
                      }
                      disabled={drawerRoomCount <= 1}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-40 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs text-slate-800 min-w-16 text-center">
                      {drawerRoomCount}{" "}
                      {drawerRoomCount === 1 ? "Room" : "Rooms"}
                      {drawerRoomCount >= totalInventory ? " (All)" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDrawerRoomCount((prev) =>
                          Math.min(totalInventory, prev + 1)
                        )
                      }
                      disabled={drawerRoomCount >= totalInventory}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-40 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Override Inputs */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Override Rates for Range
                </span>
                <div>
                  <Input
                    type="number"
                    placeholder={`Nightly Rate (Base: ₹${
                      property?.pricePerNight || 0
                    })`}
                    value={rangeCustomPrice}
                    onChange={(e) => setRangeCustomPrice(e.target.value)}
                    className="rounded-xl text-xs py-2 font-mono font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder={`Adult (Base: ₹${
                      property?.extraAdultFee || 0
                    })`}
                    value={rangeExtraAdultPrice}
                    onChange={(e) => setRangeExtraAdultPrice(e.target.value)}
                    className="rounded-xl text-xs py-1.5 font-mono"
                  />
                  <Input
                    type="number"
                    placeholder={`Kid (Base: ₹${property?.extraChildFee || 0})`}
                    value={rangeExtraChildPrice}
                    onChange={(e) => setRangeExtraChildPrice(e.target.value)}
                    className="rounded-xl text-xs py-1.5 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveRangeCustomRate}
                  disabled={actionLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Rates for {nightsCount} Nights</span>
                </button>
              </div>

              {/* Block & Release Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBlockSelectedRange}
                  disabled={actionLoading}
                  className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Block Range</span>
                </button>
                <button
                  type="button"
                  onClick={handleReleaseSelectedRange}
                  disabled={actionLoading}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Release Range</span>
                </button>
              </div>
            </div>
          ) : selectedDate ? (
            /* Single Date Inspector */
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Selected Date Inspector
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedDate.format("dddd, DD MMMM YYYY")}
                  </h3>
                </div>
                {isGloballyBlocked(selectedDateStr) ? (
                  <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Blocked</span>
                  </span>
                ) : totalInventory > 0 &&
                  getUsedRoomsCount(selectedDateStr) > 0 ? (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BedDouble className="w-3 h-3 text-amber-600" />
                    <span>
                      {getUsedRoomsCount(selectedDateStr)}/{totalInventory} Used
                    </span>
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Available</span>
                  </span>
                )}
              </div>

              {/* Effective Pricing Overview */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Daily Nightly Rate:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{effectiveNightlyPrice.toLocaleString("en-IN")}
                    </span>
                    {hasCustomPrice ? (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md border border-amber-200">
                        Custom
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                        Base
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
                  <span className="text-slate-500">Extra Adult / Kid:</span>
                  <span className="font-medium text-slate-700 font-mono">
                    ₹{Number(effectiveAdultFee).toLocaleString("en-IN")} / ₹
                    {Number(effectiveChildFee).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Rate Override Form */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Set Custom Rate &amp; Fees
                  </span>
                  {(hasCustomPrice ||
                    hasCustomAdultFee ||
                    hasCustomChildFee) && (
                    <button
                      type="button"
                      onClick={handleClearSingleDateCustomRates}
                      disabled={actionLoading}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                    >
                      Reset to Base
                    </button>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder={`Nightly Rate (Base: ₹${
                      property?.pricePerNight?.toLocaleString("en-IN") || 0
                    })`}
                    value={singleDateCustomPrice}
                    onChange={(e) => setSingleDateCustomPrice(e.target.value)}
                    className="rounded-xl text-xs py-2 font-mono font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder={`Adult (Base: ₹${
                      property?.extraAdultFee || 0
                    })`}
                    value={singleDateExtraAdultPrice}
                    onChange={(e) =>
                      setSingleDateExtraAdultPrice(e.target.value)
                    }
                    className="rounded-xl text-xs py-1.5 font-mono"
                  />
                  <Input
                    type="number"
                    placeholder={`Kid (Base: ₹${property?.extraChildFee || 0})`}
                    value={singleDateExtraChildPrice}
                    onChange={(e) =>
                      setSingleDateExtraChildPrice(e.target.value)
                    }
                    className="rounded-xl text-xs py-1.5 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveSingleDateCustomRate}
                  disabled={actionLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save for {selectedDate.format("DD MMM")}</span>
                </button>
              </div>

              {/* Quick Block / Release Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {isGloballyBlocked(selectedDateStr) ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleReleaseSingleDate(selectedAvailability)
                    }
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unblock Date</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSingleDateIncreaseBlocked()}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Block Date</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-all border border-slate-200"
                  title="Open full drawer for room-by-room details"
                >
                  <span>More Details</span>
                </button>
              </div>
            </div>
          ) : (
            /* Default: Property Quick Overview & Guide */
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CalendarIcon className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Calendar Quick Guide
                </h3>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3">
                  <p className="font-semibold text-amber-950">
                    💡 Click or Drag to Inspect
                  </p>
                  <p className="text-[11px] text-amber-800/90 mt-1 leading-relaxed">
                    Click any single date or drag across multiple dates on the
                    calendar to instantly view rates, set custom pricing, or
                    block/release inventory.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 space-y-2">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-400">
                    Property Baseline
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Nightly:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Extra Adult / Kid:</span>
                    <span className="font-medium text-slate-700 font-mono">
                      ₹{property?.extraAdultFee || 0} / ₹
                      {property?.extraChildFee || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inventory:</span>
                    <span className="font-bold text-slate-800">
                      {totalInventory} {totalInventory === 1 ? "Room" : "Rooms"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

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

      {/* 5. Selected Date / Range Action Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            <span>
              {isMultiCustomDates
                ? `Custom Dates Actions (${selectedCustomDates.length} Dates Selected)`
                : isMultiDayRange
                ? `Range Actions: ${selectionRange[0].format(
                    "DD MMM"
                  )} – ${selectionRange[1].format(
                    "DD MMM YYYY"
                  )} (${nightsCount} Nights)`
                : `Date Actions: ${
                    selectedDate ? selectedDate.format("ddd, DD MMMM YYYY") : ""
                  }`}
            </span>
          </div>
        }
        placement="right"
        width={440}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        className="custom-admin-drawer"
      >
        <div className="space-y-6 font-sans text-xs text-slate-700">
          {/* If Discrete Multi-Dates Selected */}
          {isMultiCustomDates ? (
            <>
              {/* Status Details for Selected Dates */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Selected Dates Overview
                  </span>
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{selectedCustomDates.length} Dates</span>
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">
                      Selected ({selectedCustomDates.length}):
                    </span>
                    <button
                      type="button"
                      onClick={handleClearCustomDates}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white border border-slate-200 rounded-xl">
                    {selectedCustomDates.map((dStr) => (
                      <span
                        key={dStr}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        <span>{dayjs(dStr).format("DD MMM (ddd)")}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomDate(dStr)}
                          className="hover:text-red-600 cursor-pointer text-slate-400 hover:text-slate-700"
                          title="Remove date"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Base Nightly Rate:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Adult Fee:</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      ₹{property?.extraAdultFee?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Kid Fee:</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      ₹{property?.extraChildFee?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Currently Blocked:</span>
                    <span className="font-bold text-slate-800">
                      {blockedCustomDatesCount} of {selectedCustomDates.length}{" "}
                      dates
                    </span>
                  </div>
                </div>
              </div>

              {/* Room Stepper for Custom Date Actions */}
              {totalInventory > 1 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                      <span>Apply to Specific Rooms</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Total inventory: {totalInventory}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <span className="font-bold text-slate-800 text-xs">
                      {drawerRoomCount}{" "}
                      {drawerRoomCount === 1 ? "Room" : "Rooms"}
                      {drawerRoomCount >= totalInventory
                        ? " (All Inventory)"
                        : ""}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setDrawerRoomCount((prev) => Math.max(1, prev - 1))
                        }
                        disabled={drawerRoomCount <= 1}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-40 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDrawerRoomCount((prev) =>
                            Math.min(totalInventory, prev + 1)
                          )
                        }
                        disabled={drawerRoomCount >= totalInventory}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-40 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action 1: Override Rates & Fees for Selected Dates */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Override Rates for {selectedCustomDates.length} Selected
                    Dates
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Price Override Per Night (₹)
                    </label>
                    <Input
                      type="number"
                      placeholder={`Base: ₹${property?.pricePerNight || 0}`}
                      value={customPriceOverride}
                      onChange={(e) => setCustomPriceOverride(e.target.value)}
                      prefix={
                        <span className="text-slate-400 text-xs font-bold">
                          ₹
                        </span>
                      }
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Extra Adult Fee (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder={`Base: ₹${property?.extraAdultFee || 0}`}
                        value={customExtraAdultFeeInput}
                        onChange={(e) =>
                          setCustomExtraAdultFeeInput(e.target.value)
                        }
                        prefix={
                          <span className="text-slate-400 text-xs font-bold">
                            ₹
                          </span>
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Extra Kid Fee (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder={`Base: ₹${property?.extraChildFee || 0}`}
                        value={customExtraChildFeeInput}
                        onChange={(e) =>
                          setCustomExtraChildFeeInput(e.target.value)
                        }
                        prefix={
                          <span className="text-slate-400 text-xs font-bold">
                            ₹
                          </span>
                        }
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleApplyCustomDatesRates}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>
                        Update Rates for {selectedCustomDates.length} Dates
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCustomDatesRates}
                      disabled={actionLoading}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset to Base Rates</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action 2: Block Selected Dates */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Block {selectedCustomDates.length} Selected Dates
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Reason for Blocking
                    </label>
                    <Input
                      placeholder="e.g. Maintenance, Host personal use"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleBlockCustomDates}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>
                      Block {selectedCustomDates.length} Selected Dates
                    </span>
                  </button>
                </div>
              </div>

              {/* Action 3: Release Selected Dates */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Release / Unblock {selectedCustomDates.length} Dates
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Instantly remove all manual blocks for these{" "}
                  {selectedCustomDates.length} dates and make them available for
                  booking.
                </p>
                <button
                  type="button"
                  onClick={handleReleaseCustomDates}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                  <span>
                    Release {selectedCustomDates.length} Selected Dates
                  </span>
                </button>
              </div>
            </>
          ) : isMultiDayRange ? (
            <>
              {/* Status Details for Range */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Selected Range Overview
                  </span>
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{nightsCount} Nights</span>
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dates:</span>
                    <span className="font-bold text-slate-900">
                      {selectionRange[0].format("DD MMM YYYY")} &ndash;{" "}
                      {selectionRange[1].format("DD MMM YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Nightly Rate:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      ₹{property?.pricePerNight?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Adult Fee:</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      ₹{property?.extraAdultFee?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Kid Fee:</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      ₹{property?.extraChildFee?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Currently Blocked:</span>
                    <span className="font-bold text-slate-800">
                      {blockedInRangeCount} of {nightsCount} nights
                    </span>
                  </div>
                </div>
              </div>

              {/* Room Stepper for Range Actions */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                    <span>Target Rooms for Range Actions</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">
                    Total: {totalInventory} Rooms
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 px-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDrawerRoomCount((prev) => Math.max(1, prev - 1))
                    }
                    disabled={drawerRoomCount <= 1}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer transition-all shadow-2xs"
                    title="Decrease room count"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 text-center font-bold text-xs text-slate-800">
                    {drawerRoomCount} {drawerRoomCount === 1 ? "Room" : "Rooms"}
                    {drawerRoomCount >= totalInventory && (
                      <span className="ml-1 text-[10px] text-amber-600 font-extrabold">
                        (All Rooms)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDrawerRoomCount((prev) =>
                        Math.min(totalInventory, prev + 1)
                      )
                    }
                    disabled={drawerRoomCount >= totalInventory}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer transition-all shadow-2xs"
                    title="Increase room count"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Range Actions */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">
                  Range Actions
                </h4>

                {/* Set Custom Price for Selected Range */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <span className="font-bold text-slate-900 block text-xs">
                    Set Nightly Rate &amp; Guest Fees ({nightsCount} Nights)
                  </span>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Nightly Price Override (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder={`Base: ₹${property?.pricePerNight || 0}`}
                        value={rangeCustomPrice}
                        onChange={(e) => setRangeCustomPrice(e.target.value)}
                        className="rounded-xl text-xs py-2 font-mono font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Extra Adult Fee (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder={`Base: ₹${property?.extraAdultFee || 0}`}
                          value={rangeExtraAdultPrice}
                          onChange={(e) =>
                            setRangeExtraAdultPrice(e.target.value)
                          }
                          className="rounded-xl text-xs py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Extra Kid Fee (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder={`Base: ₹${property?.extraChildFee || 0}`}
                          value={rangeExtraChildPrice}
                          onChange={(e) =>
                            setRangeExtraChildPrice(e.target.value)
                          }
                          className="rounded-xl text-xs py-1.5 font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveRangeCustomRate}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save Range Rates &amp; Guest Fees</span>
                    </button>
                  </div>
                </div>

                {/* Block Range */}
                <button
                  type="button"
                  onClick={handleBlockSelectedRange}
                  disabled={actionLoading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    Block {drawerRoomCount}{" "}
                    {drawerRoomCount === 1 ? "Room" : "Rooms"} for All{" "}
                    {nightsCount} Selected Nights
                  </span>
                </button>

                {/* Release Range */}
                <button
                  type="button"
                  onClick={handleReleaseSelectedRange}
                  disabled={actionLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Unlock className="w-4 h-4" />
                  <span>
                    Release / Unlock {drawerRoomCount}{" "}
                    {drawerRoomCount === 1 ? "Room" : "Rooms"} for All{" "}
                    {nightsCount} Nights
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Single Date Status Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Status Overview
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {selectedDate
                        ? selectedDate.format("dddd, DD MMMM YYYY")
                        : ""}
                    </span>
                  </div>
                  {isGloballyBlocked(selectedDateStr) ? (
                    <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Globally Blocked</span>
                    </span>
                  ) : totalInventory > 0 &&
                    getUsedRoomsCount(selectedDateStr) > 0 ? (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <BedDouble className="w-3 h-3 text-amber-600" />
                      <span>
                        {getUsedRoomsCount(selectedDateStr)}/{totalInventory}{" "}
                        Rooms Used
                      </span>
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>All {totalInventory} Rooms Available</span>
                    </span>
                  )}
                </div>

                {/* Custom Rates & Fees Active Alert Badge */}
                {hasCustomPrice || hasCustomAdultFee || hasCustomChildFee ? (
                  <div className="bg-indigo-50 border border-indigo-200/90 rounded-2xl p-3.5 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      {/* <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" /> */}
                      <span className="font-bold text-xs text-indigo-950">
                        Custom Overrides Active on{" "}
                        {selectedDate
                          ? selectedDate.format("DD MMM")
                          : "this Date"}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-indigo-900 font-medium pl-6">
                      {hasCustomPrice && (
                        <div className="flex items-center justify-between">
                          <span>Nightly Price Changed:</span>
                          <span className="font-bold font-mono text-indigo-950">
                            ₹
                            {Number(customNightlyPrice).toLocaleString("en-IN")}
                            <span className="text-[10px] text-indigo-600 font-normal ml-1">
                              (Base: ₹
                              {property?.pricePerNight?.toLocaleString(
                                "en-IN"
                              ) || 0}
                              )
                            </span>
                          </span>
                        </div>
                      )}
                      {hasCustomAdultFee && (
                        <div className="flex items-center justify-between">
                          <span>Extra Adult Fee Changed:</span>
                          <span className="font-bold font-mono text-indigo-950">
                            ₹{Number(customAdultFee).toLocaleString("en-IN")}
                            <span className="text-[10px] text-indigo-600 font-normal ml-1">
                              (Base: ₹
                              {(property?.extraAdultFee ?? 0).toLocaleString(
                                "en-IN"
                              )}
                              )
                            </span>
                          </span>
                        </div>
                      )}
                      {hasCustomChildFee && (
                        <div className="flex items-center justify-between">
                          <span>Extra Kid Fee Changed:</span>
                          <span className="font-bold font-mono text-indigo-950">
                            ₹{Number(customChildFee).toLocaleString("en-IN")}
                            <span className="text-[10px] text-indigo-600 font-normal ml-1">
                              (Base: ₹
                              {(property?.extraChildFee ?? 0).toLocaleString(
                                "en-IN"
                              )}
                              )
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Info className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Standard Property Base Rates &amp; Fees apply</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      No Overrides
                    </span>
                  </div>
                )}

                {/* Pricing & Fees Breakdown Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Daily Rates &amp; Guest Fees
                  </span>

                  {/* Daily Nightly Rate */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">
                      Daily Nightly Rate:
                    </span>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        ₹{effectiveNightlyPrice.toLocaleString("en-IN")}
                      </span>
                      {hasCustomPrice ? (
                        <span className="text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-md">
                          Custom Override
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
                          Base Rate
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Extra Adult Fee */}
                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                    <span className="text-slate-600 font-medium">
                      Extra Adult Fee:
                    </span>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 font-mono">
                        ₹{Number(effectiveAdultFee).toLocaleString("en-IN")} /
                        adult
                      </span>
                      {hasCustomAdultFee ? (
                        <span className="text-[9.5px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 px-1.5 py-0.5 rounded-md">
                          Custom (Base: ₹
                          {(property?.extraAdultFee ?? 0).toLocaleString(
                            "en-IN"
                          )}
                          )
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
                          Base Fee
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Extra Child Fee */}
                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                    <span className="text-slate-600 font-medium">
                      Extra Child / Kid Fee:
                    </span>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 font-mono">
                        ₹{Number(effectiveChildFee).toLocaleString("en-IN")} /
                        kid
                      </span>
                      {hasCustomChildFee ? (
                        <span className="text-[9.5px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 px-1.5 py-0.5 rounded-md">
                          Custom (Base: ₹
                          {(property?.extraChildFee ?? 0).toLocaleString(
                            "en-IN"
                          )}
                          )
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">
                          Base Fee
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Guest Capacity Info */}
                  <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span>Guest Allowance:</span>
                    <span className="font-medium text-slate-700">
                      Base {property?.baseGuests || 2} guests (Max:{" "}
                      {property?.guestsMax || 2})
                    </span>
                  </div>
                </div>

                {/* Block Source / Notes */}
                {(selectedAvailability?.source ||
                  selectedAvailability?.notes ||
                  selectedAvailability?.booking?.bookingCode) && (
                  <div className="space-y-1.5 border-t border-slate-200 pt-2.5 text-xs">
                    {selectedAvailability?.source && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Block Source:</span>
                        <span className="font-bold text-slate-800">
                          {selectedAvailability.source}
                        </span>
                      </div>
                    )}
                    {selectedAvailability?.notes && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Block Notes:</span>
                        <span className="font-bold text-slate-800">
                          {selectedAvailability.notes}
                        </span>
                      </div>
                    )}
                    {selectedAvailability?.booking?.bookingCode && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">
                          Booking Reference:
                        </span>
                        <span className="font-bold text-amber-700 font-mono">
                          #{selectedAvailability.booking.bookingCode}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions for Single Date - Moved ABOVE Rooms */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">
                  Custom Rate &amp; Whole Date Actions
                </h4>

                {/* Set Custom Price and Fees for Selected Date */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block text-xs">
                      Set Custom Rate &amp; Fees for{" "}
                      {selectedDate ? selectedDate.format("DD MMM") : ""}
                    </span>
                    {(hasCustomPrice ||
                      hasCustomAdultFee ||
                      hasCustomChildFee) && (
                      <button
                        type="button"
                        onClick={handleClearSingleDateCustomRates}
                        disabled={actionLoading}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                        title="Reset custom price and fee overrides back to property base"
                      >
                        Reset to Base
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Nightly Price Override (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder={`Base: ₹${
                          property?.pricePerNight?.toLocaleString("en-IN") || 0
                        }`}
                        value={singleDateCustomPrice}
                        onChange={(e) =>
                          setSingleDateCustomPrice(e.target.value)
                        }
                        className="rounded-xl text-xs py-2 font-mono font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Extra Adult Fee (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder={`Base: ₹${
                            property?.extraAdultFee?.toLocaleString("en-IN") ||
                            0
                          }`}
                          value={singleDateExtraAdultPrice}
                          onChange={(e) =>
                            setSingleDateExtraAdultPrice(e.target.value)
                          }
                          className="rounded-xl text-xs py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Extra Child Fee (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder={`Base: ₹${
                            property?.extraChildFee?.toLocaleString("en-IN") ||
                            0
                          }`}
                          value={singleDateExtraChildPrice}
                          onChange={(e) =>
                            setSingleDateExtraChildPrice(e.target.value)
                          }
                          className="rounded-xl text-xs py-1.5 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSingleDateCustomRate}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save Rate &amp; Guest Fees</span>
                    </button>
                  </div>
                </div>

                {/* Whole Date Block / Release (for Whole Villa or Entire Property) */}
                {!isRoomBased &&
                  (selectedAvailability?.isBlocked ? (
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
                  ))}
              </div>

              {/* Room Breakdown Card (For Room-based Properties) - Now AFTER Custom Rate & Whole Date Actions */}
              {isRoomBased && propertyRooms.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        Rooms ({getUsedRoomsCount(selectedDateStr)}/
                        {totalInventory} Used)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleBlockAllRoomsSingleDate}
                        disabled={actionLoading}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl cursor-pointer transition-all"
                      >
                        Block All
                      </button>
                      <button
                        type="button"
                        onClick={handleReleaseAllRoomsSingleDate}
                        disabled={actionLoading}
                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl cursor-pointer transition-all"
                      >
                        Release All
                      </button>
                    </div>
                  </div>

                  {/* + / - Stepper for Quick Block / Release on Single Date */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Room Inventory Used
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 font-mono">
                        {getUsedRoomsCount(selectedDateStr)} of {totalInventory}{" "}
                        Rooms Used
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSingleDateDecreaseBlocked}
                        disabled={
                          actionLoading ||
                          getUsedRoomsCount(selectedDateStr) <= 0
                        }
                        className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer transition-all shadow-2xs"
                        title="Release one room (-)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-xs text-slate-900 min-w-8 text-center font-mono">
                        {getUsedRoomsCount(selectedDateStr)}
                      </span>
                      <button
                        type="button"
                        onClick={handleSingleDateIncreaseBlocked}
                        disabled={
                          actionLoading ||
                          getUsedRoomsCount(selectedDateStr) >= totalInventory
                        }
                        className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer transition-all shadow-2xs"
                        title="Block one room (+)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {propertyRooms.map((room) => {
                      const blocked = isRoomBlockedOnDate(
                        selectedDateStr,
                        room.rawName
                      );
                      const roomRecs = getRecordsForDate(
                        selectedDateStr
                      ).filter(
                        (r) =>
                          r.roomId === room.rawName ||
                          (!r.roomId && r.isBlocked)
                      );
                      const bookedRec = roomRecs.find((r) => r.bookingId);

                      return (
                        <div
                          key={room.rawName}
                          className="py-2 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-xs">
                                {room.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({room.rawName})
                              </span>
                              {bookedRec ? (
                                <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                                  Booked
                                </span>
                              ) : blocked ? (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                                  Blocked
                                </span>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                                  Available
                                </span>
                              )}
                            </div>
                            {room.bed && (
                              <p className="text-[10px] text-slate-400 truncate">
                                {room.bed} {room.bath ? `• ${room.bath}` : ""}
                              </p>
                            )}
                            {roomRecs[0]?.notes && (
                              <p className="text-[9px] text-slate-500 italic truncate">
                                {roomRecs[0].notes}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            {blocked ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleRoomBlock(room.rawName, true)
                                }
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                title="Release this room"
                              >
                                <Unlock className="w-3 h-3" />
                                <span>Release</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleRoomBlock(room.rawName, false)
                                }
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                title="Block this room"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Block</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default PropertyCalendarPage;
