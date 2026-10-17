"use client";

import { useState } from "react";
import {
  ChevronDown,
  Download,
  X,
} from "lucide-react";
import jsPDF from "jspdf";

interface PastEvent {
  id: string;
  name: string;
  clientName: string;
  eventType: string;
  description: string | null;
  phoneNumber: string | null;
  email: string | null;
  eventDate: string | null;
  createdAt: string;
  deletedAt: string | null;
  galleryMode: string;
  totalPhotos: number;
  selectedPhotos: number;
}

type FilterType =
  | "all"
  | "event"
  | "date"
  | "range"
  | "month"
  | "category";

type SortType =
  | "event-newest"
  | "event-oldest"
  | "archived-newest"
  | "archived-oldest"
  | "name";

type ViewFilterType =
  | "all"
  | "event"
  | "date"
  | "range"
  | "month"
  | "category";

type PdfField =
  | "name"
  | "clientName"
  | "eventType"
  | "phoneNumber"
  | "email"
  | "eventDate"
  | "createdAt"
  | "deletedAt"
  | "totalPhotos"
  | "selectedPhotos"
  | "description";

const PDF_FIELDS: {
  key: PdfField;
  label: string;
}[] = [
  { key: "name", label: "Event Name" },
  { key: "clientName", label: "Client Name" },
  { key: "eventType", label: "Category" },
  { key: "phoneNumber", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "eventDate", label: "Event Date" },
  { key: "createdAt", label: "Created Date" },
  { key: "deletedAt", label: "Archived Date" },
  { key: "totalPhotos", label: "Total Photos" },
  { key: "selectedPhotos", label: "Selected Photos" },
  { key: "description", label: "Description" },
];

export default function PastEvents({
  events,
}: {
  events: PastEvent[];
}) {
  const [expandedEvent, setExpandedEvent] =
    useState<string | null>(null);

  const [showViewFilter, setShowViewFilter] =
    useState(false);

  const [viewFilterType, setViewFilterType] =
    useState<ViewFilterType>("all");

  const [viewSelectedEventId, setViewSelectedEventId] =
    useState("");

  const [viewSelectedDate, setViewSelectedDate] =
    useState("");

  const [viewStartDate, setViewStartDate] =
    useState("");

  const [viewEndDate, setViewEndDate] =
    useState("");

  const [viewSelectedMonth, setViewSelectedMonth] =
    useState("");

  const [viewSelectedCategory, setViewSelectedCategory] =
    useState("");

  const [showDownloadModal, setShowDownloadModal] =
    useState(false);

  const [filterType, setFilterType] =
    useState<FilterType>("all");

  const [selectedEventId, setSelectedEventId] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [selectedMonth, setSelectedMonth] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [sortType, setSortType] =
    useState<SortType>("archived-newest");

  const [selectedFields, setSelectedFields] =
    useState<PdfField[]>(
      PDF_FIELDS.map((field) => field.key)
    );

  const formatDate = (date: string | null) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const toggleEvent = (eventId: string) => {
    setExpandedEvent((current) =>
      current === eventId ? null : eventId
    );
  };

  const getVisibleEvents = () => {
    let result = [...events];

    if (viewFilterType === "event") {
      if (!viewSelectedEventId) return result;

      result = result.filter(
        (event) => event.id === viewSelectedEventId
      );
    }

    if (viewFilterType === "date") {
      if (!viewSelectedDate) return result;

      result = result.filter((event) => {
        if (!event.eventDate) return false;

        const eventDate = new Date(event.eventDate)
          .toISOString()
          .split("T")[0];

        return eventDate === viewSelectedDate;
      });
    }

    if (viewFilterType === "range") {
      if (!viewStartDate || !viewEndDate) return result;

      result = result.filter((event) => {
        if (!event.eventDate) return false;

        const eventDate = new Date(event.eventDate)
          .toISOString()
          .split("T")[0];

        return (
          eventDate >= viewStartDate &&
          eventDate <= viewEndDate
        );
      });
    }

    if (viewFilterType === "month") {
      if (!viewSelectedMonth) return result;

      result = result.filter((event) => {
        if (!event.eventDate) return false;

        const eventDate = new Date(event.eventDate);

        const year = eventDate.getFullYear();

        const month = String(
          eventDate.getMonth() + 1
        ).padStart(2, "0");

        return `${year}-${month}` === viewSelectedMonth;
      });
    }

    if (viewFilterType === "category") {
      if (!viewSelectedCategory) return result;

      result = result.filter(
        (event) =>
          event.eventType === viewSelectedCategory
      );
    }

    return result;
  };

  const clearViewFilter = () => {
    setViewFilterType("all");
    setViewSelectedEventId("");
    setViewSelectedDate("");
    setViewStartDate("");
    setViewEndDate("");
    setViewSelectedMonth("");
    setViewSelectedCategory("");
    setShowViewFilter(false);
  };

  const visibleEvents = getVisibleEvents();

  const toggleField = (field: PdfField) => {
    setSelectedFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    );
  };

  const categories = Array.from(
    new Set(events.map((event) => event.eventType))
  ).sort();

  const getFilteredEvents = () => {
    let result = [...events];

    if (filterType === "event") {
      if (!selectedEventId) {
        return [];
      }

      result = result.filter(
        (event) => event.id === selectedEventId
      );
    }

    if (filterType === "date") {
      if (!selectedDate) {
        return [];
      }

      result = result.filter((event) => {
        if (!event.eventDate) {
          return false;
        }

        const eventDate = new Date(event.eventDate)
          .toISOString()
          .split("T")[0];

        return eventDate === selectedDate;
      });
    }

    if (filterType === "range") {
      if (!startDate || !endDate) {
        return [];
      }

      result = result.filter((event) => {
        if (!event.eventDate) {
          return false;
        }

        const eventDate = new Date(event.eventDate)
          .toISOString()
          .split("T")[0];

        return (
          eventDate >= startDate &&
          eventDate <= endDate
        );
      });
    }

    if (filterType === "month") {
      if (!selectedMonth) {
        return [];
      }

      result = result.filter((event) => {
        if (!event.eventDate) {
          return false;
        }

        const eventDate = new Date(event.eventDate);

        const year = eventDate.getFullYear();

        const month = String(
          eventDate.getMonth() + 1
        ).padStart(2, "0");

        return `${year}-${month}` === selectedMonth;
      });
    }

    if (filterType === "category") {
      if (!selectedCategory) {
        return [];
      }

      result = result.filter(
        (event) =>
          event.eventType === selectedCategory
      );
    }

    result.sort((a, b) => {
      if (sortType === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortType === "event-newest") {
        return (
          new Date(b.eventDate || 0).getTime() -
          new Date(a.eventDate || 0).getTime()
        );
      }

      if (sortType === "event-oldest") {
        return (
          new Date(a.eventDate || 0).getTime() -
          new Date(b.eventDate || 0).getTime()
        );
      }

      if (sortType === "archived-oldest") {
        return (
          new Date(a.deletedAt || 0).getTime() -
          new Date(b.deletedAt || 0).getTime()
        );
      }

      return (
        new Date(b.deletedAt || 0).getTime() -
        new Date(a.deletedAt || 0).getTime()
      );
    });

    return result;
  };

  const getPdfValue = (
    event: PastEvent,
    field: PdfField
  ) => {
    switch (field) {
      case "name":
        return event.name || "—";

      case "clientName":
        return event.clientName || "—";

      case "eventType":
        return event.eventType || "—";

      case "phoneNumber":
        return event.phoneNumber || "—";

      case "email":
        return event.email || "—";

      case "eventDate":
        return formatDate(event.eventDate);

      case "createdAt":
        return formatDate(event.createdAt);

      case "deletedAt":
        return formatDate(event.deletedAt);

      case "totalPhotos":
        return String(event.totalPhotos);

      case "selectedPhotos":
        return String(event.selectedPhotos);

      case "description":
        return event.description || "—";

      default:
        return "—";
    }
  };

  const downloadPdf = () => {
    if (selectedFields.length === 0) {
      return;
    }

    const filteredEvents = getFilteredEvents();

    if (filteredEvents.length === 0) {
      alert(
        "No past events match the selected filter."
      );

      return;
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 10;

    const tableWidth =
      pageWidth - margin * 2;

    const columnWidth =
      tableWidth / selectedFields.length;

    const rowHeight = 8;

    const headerHeight = 10;

    let currentY = 30;

    const drawHeader = () => {
      pdf.setFontSize(16);

      pdf.setFont("helvetica", "bold");

      pdf.text(
        "Past Events Summary",
        margin,
        15
      );

      pdf.setFontSize(9);

      pdf.setFont("helvetica", "normal");

      const filterText =
        filterType === "all"
          ? "All Past Events"
          : filterType === "event"
            ? "Specific Event"
            : filterType === "date"
              ? `Date: ${selectedDate}`
              : filterType === "range"
                ? `Date Range: ${startDate} to ${endDate}`
                : filterType === "month"
                  ? `Month: ${selectedMonth}`
                  : `Category: ${selectedCategory}`;

      pdf.text(
        filterText,
        margin,
        22
      );

      currentY = 30;

      pdf.setFontSize(7);

      pdf.setFont("helvetica", "bold");

      selectedFields.forEach(
        (fieldKey, index) => {
          const field = PDF_FIELDS.find(
            (item) => item.key === fieldKey
          );

          const x =
            margin + index * columnWidth;

          pdf.rect(
            x,
            currentY,
            columnWidth,
            headerHeight
          );

          pdf.text(
            field?.label || "",
            x + 2,
            currentY + 6,
            {
              maxWidth: columnWidth - 4,
            }
          );
        }
      );

      currentY += headerHeight;

      pdf.setFont("helvetica", "normal");
    };

    const drawRow = (event: PastEvent) => {
      let maxLines = 1;

      const values = selectedFields.map(
        (field) =>
          getPdfValue(event, field)
      );

      const wrappedValues = values.map(
        (value) => {
          const lines =
            pdf.splitTextToSize(
              value,
              columnWidth - 4
            );

          maxLines = Math.max(
            maxLines,
            lines.length
          );

          return lines;
        }
      );

      const calculatedHeight = Math.max(
        rowHeight,
        maxLines * 4 + 4
      );

      if (
        currentY + calculatedHeight >
        pageHeight - margin
      ) {
        pdf.addPage();

        drawHeader();
      }

      selectedFields.forEach(
        (_, index) => {
          const x =
            margin + index * columnWidth;

          pdf.rect(
            x,
            currentY,
            columnWidth,
            calculatedHeight
          );

          pdf.setFontSize(6.5);

          pdf.text(
            wrappedValues[index],
            x + 2,
            currentY + 4,
            {
              maxWidth: columnWidth - 4,
            }
          );
        }
      );

      currentY += calculatedHeight;
    };

    drawHeader();

    filteredEvents.forEach((event) => {
      drawRow(event);
    });

    const totalPages =
      pdf.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      pdf.setPage(page);

      pdf.setFontSize(7);

      pdf.setFont("helvetica", "normal");

      pdf.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 5,
        {
          align: "right",
        }
      );
    }

    pdf.save("past-events-summary.pdf");

    setShowDownloadModal(false);
  };

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-sm text-zinc-500">
        No past events yet.
      </div>
    );
  }

  return (
    <>
      {/* Sticky Past Events Actions */}
      <div className="sticky top-16 z-30 -mx-4 mb-5 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setShowViewFilter(true)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Filter
          </button>

          <button
            type="button"
            onClick={() =>
              setShowDownloadModal(true)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Download Summary
          </button>
        </div>
      </div>

      {/* Past Events */}
      {visibleEvents.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-500">
            No past events match this filter.
          </p>

          <button
            type="button"
            onClick={clearViewFilter}
            className="mt-3 text-sm font-medium text-white hover:underline"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleEvents.map((event) => {
            const isExpanded =
              expandedEvent === event.id;

            return (
              <div
                key={event.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                {/* Main Row */}
                <button
                  type="button"
                  onClick={() =>
                    toggleEvent(event.id)
                  }
                  className="w-full p-5 text-left transition hover:bg-zinc-800/30"
                >
                  <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <div>
                      <p className="text-xs text-zinc-500">
                        Event
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {event.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">
                        Client
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {event.clientName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">
                        Category
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {event.eventType}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <ChevronDown
                        className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${
                          isExpanded
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-5 pb-5 pt-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-zinc-500">
                          Total Photos
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {event.totalPhotos}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Selected
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {event.selectedPhotos}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Phone Number
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {event.phoneNumber ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-zinc-200">
                          {event.email || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Event Date
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {formatDate(
                            event.eventDate
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Archived
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {formatDate(
                            event.deletedAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Created
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {formatDate(
                            event.createdAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Description
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          {event.description ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* View Filter Modal */}
      {showViewFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Filter Past Events
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  This filter only controls which past event cards are shown.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowViewFilter(false)
                }
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  ["all", "All Past Events"],
                  ["event", "Specific Event"],
                  ["date", "Specific Date"],
                  ["range", "Date Range"],
                  ["month", "Month"],
                  ["category", "Category"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setViewFilterType(
                        value as ViewFilterType
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-sm transition ${
                      viewFilterType === value
                        ? "border-white bg-white text-black"
                        : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                {viewFilterType === "event" && (
                  <select
                    value={viewSelectedEventId}
                    onChange={(e) =>
                      setViewSelectedEventId(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="">
                      Select an event
                    </option>

                    {events.map((event) => (
                      <option
                        key={event.id}
                        value={event.id}
                      >
                        {event.name} —{" "}
                        {event.clientName}
                      </option>
                    ))}
                  </select>
                )}

                {viewFilterType === "date" && (
                  <input
                    type="date"
                    value={viewSelectedDate}
                    onChange={(e) =>
                      setViewSelectedDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                  />
                )}

                {viewFilterType === "range" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs text-zinc-500">
                        From
                      </label>

                      <input
                        type="date"
                        value={viewStartDate}
                        onChange={(e) =>
                          setViewStartDate(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs text-zinc-500">
                        To
                      </label>

                      <input
                        type="date"
                        value={viewEndDate}
                        onChange={(e) =>
                          setViewEndDate(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                      />
                    </div>
                  </div>
                )}

                {viewFilterType === "month" && (
                  <div>
                    <label className="mb-2 block text-xs text-zinc-500">
                      Event Month
                    </label>

                    <input
                      type="month"
                      value={viewSelectedMonth}
                      onChange={(e) =>
                        setViewSelectedMonth(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                    />

                    <p className="mt-2 text-xs text-zinc-500">
                      This filters events using their Event Date.
                    </p>
                  </div>
                )}

                {viewFilterType === "category" && (
                  <select
                    value={viewSelectedCategory}
                    onChange={(e) =>
                      setViewSelectedCategory(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="">
                      Select a category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowViewFilter(false)
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowViewFilter(false)
                }
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Summary Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Download Summary
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Choose the events and details to
                  include in your PDF.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDownloadModal(false)
                }
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto px-6 py-6">
              {/* Filter */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Filter Events
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    ["all", "All Past Events"],
                    ["event", "Specific Event"],
                    ["date", "Specific Date"],
                    ["range", "Date Range"],
                    ["month", "Month"],
                    ["category", "Category"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFilterType(
                          value as FilterType
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm transition ${
                        filterType === value
                          ? "border-white bg-white text-black"
                          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Options */}
              <div className="mt-5">
                {filterType === "event" && (
                  <select
                    value={selectedEventId}
                    onChange={(e) =>
                      setSelectedEventId(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="">
                      Select an event
                    </option>

                    {events.map((event) => (
                      <option
                        key={event.id}
                        value={event.id}
                      >
                        {event.name} —{" "}
                        {event.clientName}
                      </option>
                    ))}
                  </select>
                )}

                {filterType === "date" && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      setSelectedDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                  />
                )}

                {filterType === "range" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs text-zinc-500">
                        From
                      </label>

                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                          setStartDate(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs text-zinc-500">
                        To
                      </label>

                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                          setEndDate(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                      />
                    </div>
                  </div>
                )}

                {filterType === "month" && (
                  <div>
                    <label className="mb-2 block text-xs text-zinc-500">
                      Event Month
                    </label>

                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                    />

                    <p className="mt-2 text-xs text-zinc-500">
                      This filters events using their
                      Event Date.
                    </p>
                  </div>
                )}

                {filterType === "category" && (
                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="">
                      Select a category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Fields */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-white">
                  Include in PDF
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PDF_FIELDS.map((field) => (
                    <label
                      key={field.key}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(
                          field.key
                        )}
                        onChange={() =>
                          toggleField(
                            field.key
                          )
                        }
                        className="h-4 w-4"
                      />

                      {field.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-white">
                  Sort PDF
                </h3>

                <select
                  value={sortType}
                  onChange={(e) =>
                    setSortType(
                      e.target.value as SortType
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white"
                >
                  <option value="archived-newest">
                    Archived Date — Newest First
                  </option>

                  <option value="archived-oldest">
                    Archived Date — Oldest First
                  </option>

                  <option value="event-newest">
                    Event Date — Newest First
                  </option>

                  <option value="event-oldest">
                    Event Date — Oldest First
                  </option>

                  <option value="name">
                    Event Name — A-Z
                  </option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowDownloadModal(false)
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={downloadPdf}
                disabled={
                  selectedFields.length === 0
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}