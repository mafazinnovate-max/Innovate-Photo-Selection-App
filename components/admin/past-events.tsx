"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  X,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import jsPDF from "jspdf";
import {
  createExternalEvent,
  updateExternalEvent,
  deleteExternalEvent,
} from "@/actions/external-event";

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
  hardDiskName?: string | null;
  folders: {
    id: string;
    name: string;
    parentId: string | null;
    hardDiskName?: string | null;
    deletedAt: string | null;
  }[];
  galleryMode: string;
  source: "picknovate" | "external";
}

type FilterType =
  | "all"
  | "event"
  | "date"
  | "range"
  | "month"
  | "category"
  | "hardDisk";

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
  | "category"
  | "hardDisk";

type PdfField =
  | "name"
  | "clientName"
  | "eventType"
  | "phoneNumber"
  | "email"
  | "eventDate"
  | "createdAt"
  | "deletedAt"
  | "description"
  | "hardDisk";

type SourceFilter = "all" | "picknovate" | "external";

const EVENT_CATEGORIES = [
  "Wedding",
  "Reception",
  "Birthday",
  "Engagement",
  "Puberty",
  "Other",
] as const;

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
  { key: "description", label: "Description" },
  { key: "hardDisk", label: "Hard Disk Name" },
];

interface ExternalEventForm {
  name: string;
  clientName: string;
  eventCategory: string;
  customEventCategory: string;
  phoneNumber: string;
  email: string;
  eventDate: string;
  description: string;
  hardDiskName: string;
}

type ExternalRequiredField =
  | "clientName"
  | "name"
  | "eventDate"
  | "eventCategory"
  | "customEventCategory";

const EMPTY_EXTERNAL_FORM: ExternalEventForm = {
  name: "",
  clientName: "",
  eventCategory: "",
  customEventCategory: "",
  phoneNumber: "",
  email: "",
  eventDate: "",
  description: "",
  hardDiskName: "",
};

export default function PastEvents({
  events,
}: {
  events: PastEvent[];
}) {
  const [expandedEvent, setExpandedEvent] =
    useState<string | null>(null);

  const [sourceFilter, setSourceFilter] =
    useState<SourceFilter>("all");

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

  const [viewSelectedHardDisk, setViewSelectedHardDisk] =
    useState("");

  const [showDownloadModal, setShowDownloadModal] =
    useState(false);

  const [pdfSourceFilter, setPdfSourceFilter] =
    useState<SourceFilter>("all");

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

  const [selectedHardDisk, setSelectedHardDisk] =
    useState("");

  const [sortType, setSortType] =
    useState<SortType>("archived-newest");

  const [selectedFields, setSelectedFields] =
    useState<PdfField[]>(
      PDF_FIELDS.map((field) => field.key)
    );

  const EVENTS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const [showExternalModal, setShowExternalModal] =
    useState(false);

  const [editingExternalEvent, setEditingExternalEvent] =
    useState<PastEvent | null>(null);

  const [externalForm, setExternalForm] =
    useState<ExternalEventForm>(EMPTY_EXTERNAL_FORM);

  const [isSavingExternal, setIsSavingExternal] =
    useState(false);

  const [deletingExternalId, setDeletingExternalId] =
    useState<string | null>(null);

  const [deleteConfirmationEvent, setDeleteConfirmationEvent] =
    useState<PastEvent | null>(null);

  const [externalFieldErrors, setExternalFieldErrors] =
    useState<
      Partial<
        Record<ExternalRequiredField, string>
      >
    >({});

  const [externalActionError, setExternalActionError] =
    useState("");

  const [openExternalMenuId, setOpenExternalMenuId] =
    useState<string | null>(null);

  const clientNameRef =
    useRef<HTMLInputElement | null>(null);

  const eventNameRef =
    useRef<HTMLInputElement | null>(null);

  const eventCategoryRef =
    useRef<HTMLSelectElement | null>(null);

  const customEventCategoryRef =
    useRef<HTMLInputElement | null>(null);

  const eventDateRef =
    useRef<HTMLInputElement | null>(null);

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

  const formatInputDate = (date: string | null) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  const toggleEvent = (eventId: string) => {
    setExpandedEvent((current) =>
      current === eventId ? null : eventId
    );

    setOpenExternalMenuId(null);
  };

  const openCreateExternalModal = () => {
    setEditingExternalEvent(null);
    setExternalForm(EMPTY_EXTERNAL_FORM);
    setExternalFieldErrors({});
    setExternalActionError("");
    setShowExternalModal(true);
    setOpenExternalMenuId(null);
  };

  const openEditExternalModal = (
    event: PastEvent
  ) => {
    const isStandardCategory =
      EVENT_CATEGORIES.some(
        (category) =>
          category !== "Other" &&
          category === event.eventType
      );

    setEditingExternalEvent(event);

    setExternalForm({
      name: event.name,
      clientName: event.clientName,
      eventCategory: isStandardCategory
        ? event.eventType
        : "Other",
      customEventCategory: isStandardCategory
        ? ""
        : event.eventType === "Other"
          ? ""
          : event.eventType,
      phoneNumber: event.phoneNumber || "",
      email: event.email || "",
      eventDate: formatInputDate(event.eventDate),
      description: event.description || "",
      hardDiskName: event.hardDiskName || "",
    });

    setExternalFieldErrors({});
    setExternalActionError("");
    setShowExternalModal(true);
    setOpenExternalMenuId(null);
  };

  const closeExternalModal = () => {
    if (isSavingExternal) {
      return;
    }

    setShowExternalModal(false);
    setEditingExternalEvent(null);
    setExternalForm(EMPTY_EXTERNAL_FORM);
    setExternalFieldErrors({});
    setExternalActionError("");
  };

  const updateExternalForm = (
    field: keyof ExternalEventForm,
    value: string
  ) => {
    setExternalForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (
      field === "clientName" ||
      field === "name" ||
      field === "eventDate" ||
      field === "eventCategory" ||
      field === "customEventCategory"
    ) {
      setExternalFieldErrors((current) => {
        const updated = { ...current };

        delete updated[
          field as ExternalRequiredField
        ];

        if (
          field === "eventCategory" &&
          value !== "Other"
        ) {
          delete updated.customEventCategory;
        }

        return updated;
      });
    }
  };

  const focusExternalField = (
    field: ExternalRequiredField
  ) => {
    const refs: Record<
      ExternalRequiredField,
      React.RefObject<
        HTMLInputElement | HTMLSelectElement | null
      >
    > = {
      clientName: clientNameRef,
      name: eventNameRef,
      eventDate: eventDateRef,
      eventCategory: eventCategoryRef,
      customEventCategory:
        customEventCategoryRef,
    };

    const element = refs[field].current;

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(() => {
      element.focus({
        preventScroll: true,
      });
    }, 150);
  };

  const validateExternalEvent = () => {
    const errors: Partial<
      Record<ExternalRequiredField, string>
    > = {};

    const clientName =
      externalForm.clientName.trim();

    const eventName =
      externalForm.name.trim();

    const eventDate =
      externalForm.eventDate.trim();

    const eventCategory =
      externalForm.eventCategory.trim();

    const customCategory =
      externalForm.customEventCategory.trim();

    if (!clientName) {
      errors.clientName =
        "Client Name is required.";
    }

    if (!eventName) {
      errors.name =
        "Event Name is required.";
    }

    if (!eventDate) {
      errors.eventDate =
        "Event Date is required.";
    }

    if (!eventCategory) {
      errors.eventCategory =
        "Event Category is required.";
    }

    if (
      eventCategory === "Other" &&
      !customCategory
    ) {
      errors.customEventCategory =
        "Please enter the event category.";
    }

    setExternalFieldErrors(errors);

    const firstInvalidField:
      | ExternalRequiredField
      | null =
      errors.clientName
        ? "clientName"
        : errors.name
          ? "name"
          : errors.eventDate
            ? "eventDate"
            : errors.eventCategory
              ? "eventCategory"
              : errors.customEventCategory
                ? "customEventCategory"
                : null;

    if (firstInvalidField) {
      focusExternalField(firstInvalidField);
      return false;
    }

    return true;
  };

  const saveExternalEvent = async () => {
    if (!validateExternalEvent()) {
      return;
    }

    const finalEventCategory =
      externalForm.eventCategory === "Other"
        ? externalForm.customEventCategory.trim()
        : externalForm.eventCategory.trim();

    try {
      setIsSavingExternal(true);
      setExternalActionError("");

      if (editingExternalEvent) {
        await updateExternalEvent({
          id: editingExternalEvent.id,
          name: externalForm.name,
          clientName: externalForm.clientName,
          eventType: finalEventCategory,
          phoneNumber: externalForm.phoneNumber,
          email: externalForm.email,
          eventDate: externalForm.eventDate,
          description: externalForm.description,
          hardDiskName: externalForm.hardDiskName,
        });
      } else {
        await createExternalEvent({
          name: externalForm.name,
          clientName: externalForm.clientName,
          eventType: finalEventCategory,
          phoneNumber: externalForm.phoneNumber,
          email: externalForm.email,
          eventDate: externalForm.eventDate,
          description: externalForm.description,
          hardDiskName: externalForm.hardDiskName,
        });
      }

      setShowExternalModal(false);
      setEditingExternalEvent(null);
      setExternalForm(EMPTY_EXTERNAL_FORM);
      setExternalFieldErrors({});
      setExternalActionError("");
    } catch (error) {
      console.error(
        "Failed to save external event:",
        error
      );

      setExternalActionError(
        "Failed to save the external event. Please try again."
      );
    } finally {
      setIsSavingExternal(false);
    }
  };

  const handleExternalFormSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    void saveExternalEvent();
  };

  const handleDeleteExternalEvent = (
    event: PastEvent
  ) => {
    if (deletingExternalId) {
      return;
    }

    setOpenExternalMenuId(null);
    setDeleteConfirmationEvent(event);
  };

  const cancelDeleteExternalEvent = () => {
    if (deletingExternalId) {
      return;
    }

    setDeleteConfirmationEvent(null);
  };

  const confirmDeleteExternalEvent = async () => {
    if (
      !deleteConfirmationEvent ||
      deletingExternalId
    ) {
      return;
    }

    const event = deleteConfirmationEvent;

    try {
      setDeletingExternalId(event.id);

      await deleteExternalEvent(event.id);

      if (expandedEvent === event.id) {
        setExpandedEvent(null);
      }

      setDeleteConfirmationEvent(null);
    } catch (error) {
      console.error(
        "Failed to delete external event:",
        error
      );

      setDeleteConfirmationEvent(null);
      setExternalActionError(
        "Failed to delete the external event. Please try again."
      );
    } finally {
      setDeletingExternalId(null);
    }
  };

  const getVisibleEvents = () => {
    let result = [...events];

    if (sourceFilter !== "all") {
      result = result.filter(
        (event) =>
          event.source === sourceFilter
      );
    }

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

        const eventDate = new Date(
          event.eventDate
        );

        const year = eventDate.getFullYear();

        const month = String(
          eventDate.getMonth() + 1
        ).padStart(2, "0");

        return `${year}-${month}` ===
          viewSelectedMonth;
      });
    }

    if (viewFilterType === "category") {
      if (!viewSelectedCategory) return result;

      result = result.filter(
        (event) =>
          event.eventType ===
          viewSelectedCategory
      );
    }

    if (viewFilterType === "hardDisk") {
      if (!viewSelectedHardDisk) return result;

      result = result.filter((event) => {
        if (event.source === "external") {
          return (
            event.hardDiskName ===
            viewSelectedHardDisk
          );
        }

        return event.folders.some(
          (folder) =>
            folder.hardDiskName ===
            viewSelectedHardDisk
        );
      });
    }

    return result;
  };

  const clearViewFilter = () => {
    setViewFilterType("all");
    setSourceFilter("all");
    setViewSelectedEventId("");
    setViewSelectedDate("");
    setViewStartDate("");
    setViewEndDate("");
    setViewSelectedMonth("");
    setViewSelectedCategory("");
    setViewSelectedHardDisk("");
    setShowViewFilter(false);
  };

  const visibleEvents = getVisibleEvents();

  const totalPages = Math.max(
    1,
    Math.ceil(
      visibleEvents.length / EVENTS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedEvents = visibleEvents.slice(
    (safeCurrentPage - 1) * EVENTS_PER_PAGE,
    safeCurrentPage * EVENTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    sourceFilter,
    viewFilterType,
    viewSelectedEventId,
    viewSelectedDate,
    viewStartDate,
    viewEndDate,
    viewSelectedMonth,
    viewSelectedCategory,
    viewSelectedHardDisk,
  ]);

  const toggleField = (field: PdfField) => {
    setSelectedFields((current) =>
      current.includes(field)
        ? current.filter(
            (item) => item !== field
          )
        : [...current, field]
    );
  };

  const categories = Array.from(
    new Set(
      events.map((event) => event.eventType)
    )
  ).sort();

  const getFilteredEvents = () => {
    let result = [...events];

    if (pdfSourceFilter !== "all") {
      result = result.filter(
        (event) =>
          event.source === pdfSourceFilter
      );
    }

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

        const eventDate = new Date(
          event.eventDate
        );

        const year = eventDate.getFullYear();

        const month = String(
          eventDate.getMonth() + 1
        ).padStart(2, "0");

        return `${year}-${month}` ===
          selectedMonth;
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

    if (filterType === "hardDisk") {
      if (!selectedHardDisk) {
        return [];
      }

      result = result.filter((event) => {
        if (event.source === "external") {
          return (
            event.hardDiskName ===
            selectedHardDisk
          );
        }

        return event.folders.some(
          (folder) =>
            folder.hardDiskName ===
            selectedHardDisk
        );
      });
    }

    result.sort((a, b) => {
      if (sortType === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortType === "event-newest") {
        return (
          new Date(
            b.eventDate || 0
          ).getTime() -
          new Date(
            a.eventDate || 0
          ).getTime()
        );
      }

      if (sortType === "event-oldest") {
        return (
          new Date(
            a.eventDate || 0
          ).getTime() -
          new Date(
            b.eventDate || 0
          ).getTime()
        );
      }

      if (sortType === "archived-oldest") {
        return (
          new Date(
            a.deletedAt || 0
          ).getTime() -
          new Date(
            b.deletedAt || 0
          ).getTime()
        );
      }

      return (
        new Date(
          b.deletedAt || 0
        ).getTime() -
        new Date(
          a.deletedAt || 0
        ).getTime()
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
        return event.source === "external"
          ? "—"
          : formatDate(event.deletedAt);

      case "description":
        return event.description || "—";

      case "hardDisk":
        if (event.source === "external") {
          return event.hardDiskName || "—";
        }

        return event.folders.length > 0
          ? event.folders
              .map(
                (folder) =>
                  `${folder.name}: ${
                    folder.hardDiskName || "—"
                  }`
              )
              .join("\n")
          : "—";

      default:
        return "—";
    }
  };

  const downloadPdf = () => {
    if (selectedFields.length === 0) {
      return;
    }

    const filteredEvents =
      getFilteredEvents();

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

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.text(
        "Past Events Summary",
        margin,
        15
      );

      pdf.setFontSize(9);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      const sourceText =
        pdfSourceFilter === "all"
          ? "Source: All"
          : pdfSourceFilter ===
              "picknovate"
            ? "Source: Picknovate"
            : "Source: External";

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
                  : filterType ===
                      "hardDisk"
                    ? `Hard Disk: ${selectedHardDisk}`
                    : `Category: ${selectedCategory}`;

      pdf.text(
        `${sourceText} | ${filterText}`,
        margin,
        22
      );

      currentY = 30;

      pdf.setFontSize(7);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      selectedFields.forEach(
        (fieldKey, index) => {
          const field =
            PDF_FIELDS.find(
              (item) =>
                item.key === fieldKey
            );

          const x =
            margin +
            index * columnWidth;

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
              maxWidth:
                columnWidth - 4,
            }
          );
        }
      );

      currentY += headerHeight;

      pdf.setFont(
        "helvetica",
        "normal"
      );
    };

    const drawRow = (
      event: PastEvent
    ) => {
      let maxLines = 1;

      const values =
        selectedFields.map(
          (field) =>
            getPdfValue(
              event,
              field
            )
        );

      const wrappedValues =
        values.map((value) => {
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
        });

      const calculatedHeight =
        Math.max(
          rowHeight,
          maxLines * 4 + 4
        );

      if (
        currentY +
          calculatedHeight >
        pageHeight - margin
      ) {
        pdf.addPage();

        drawHeader();
      }

      selectedFields.forEach(
        (_, index) => {
          const x =
            margin +
            index * columnWidth;

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
              maxWidth:
                columnWidth - 4,
            }
          );
        }
      );

      currentY +=
        calculatedHeight;
    };

    drawHeader();

    filteredEvents.forEach(
      (event) => {
        drawRow(event);
      }
    );

    const totalPages =
      pdf.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      pdf.setPage(page);

      pdf.setFontSize(7);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 5,
        {
          align: "right",
        }
      );
    }

    pdf.save(
      "past-events-summary.pdf"
    );

    setShowDownloadModal(false);
  };

  const allHardDisks = Array.from(
    new Set(
      events.flatMap((event) => {
        if (
          event.source ===
          "external"
        ) {
          return event.hardDiskName
            ? [event.hardDiskName]
            : [];
        }

        return event.folders
          .map(
            (folder) =>
              folder.hardDiskName
          )
          .filter(
            (
              hardDisk
            ): hardDisk is string =>
              Boolean(hardDisk)
          );
      })
    )
  ).sort();

  return (
    <>
      {/* Sticky Past Events Actions */}
      <div className="sticky top-16 z-30 -mx-4 mb-5 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
          {[
  ["all", "All"],
  ["picknovate", "Picknnovate"],
  ["external", "External"],
].map(
  ([value, label]) => (
    <button
      key={value}
      type="button"
      onClick={() =>
        setSourceFilter(
          value as SourceFilter
        )
      }
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
        sourceFilter === value
          ? "border-white bg-white text-black hover:bg-zinc-200 hover:border-zinc-200"
          : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      {value === "picknovate" ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-[9px] font-black leading-none text-zinc-950 shadow-sm">
            P
          </span>

          <span>
            <span className="font-bold">
              Pick
            </span>
            <span className="font-bold text-amber-500">
              nnovate
            </span>
          </span>
        </span>
      ) : (
        label
      )}
    </button>
  )
)}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                openCreateExternalModal
              }
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:border-zinc-500 hover:bg-zinc-800 hover:shadow-2xl hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />

              <span>
                Add External Event
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setShowViewFilter(true)
              }
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:border-zinc-500 hover:bg-zinc-800 hover:shadow-2xl hover:shadow-black/30 active:translate-y-0 active:scale-[0.98]"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">
                Filter
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setShowDownloadModal(
                  true
                )
              }
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:bg-zinc-100 hover:shadow-2xl hover:shadow-white/20 active:translate-y-0 active:scale-[0.98]"
            >
              <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />

              <span>
                Download Summary
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Past Events */}
      {visibleEvents.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-500">
            {sourceFilter ===
            "external"
              ? "No external events yet."
              : sourceFilter ===
                  "picknovate"
                ? "No Picknnovate past events match this filter."
                : "No past events match this filter."}
          </p>

          {sourceFilter ===
          "external" ? (
            <button
              type="button"
              onClick={
                openCreateExternalModal
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />

              Add External Event
            </button>
          ) : (
            <button
              type="button"
              onClick={
                clearViewFilter
              }
              className="mt-3 text-sm font-medium text-white hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedEvents.map(
            (event) => {
              const isExpanded =
                expandedEvent ===
                event.id;

              const isExternal =
                event.source ===
                "external";

              const isMenuOpen =
                openExternalMenuId ===
                event.id;

              return (
                <div
                  key={`${event.source}-${event.id}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900"
                >
                  {/* Main Row */}
                  <div className="grid grid-cols-1 items-center gap-4 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_88px]">
                    <button
                      type="button"
                      onClick={() =>
                        toggleEvent(
                          event.id
                        )
                      }
                      className="text-left transition hover:text-zinc-300"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-zinc-500">
                          Event
                        </p>

                        {isExternal ? (
                          <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300">
                            External
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-500/10 px-2.5 py-1 shadow-[0_0_14px_rgba(245,158,11,0.08)]">
                            <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-[9px] font-black leading-none text-zinc-950 shadow-sm">
                              P
                            </span>

                            <span className="text-[10px] font-bold tracking-tight text-zinc-100">
                              <span className="text-white">
                                Pick
                              </span>

                              <span className="text-amber-400">
                                nnovate
                              </span>
                            </span>
                          </span>
                        )}
                      </div>

                      <p className="mt-1 font-semibold text-white">
                        {event.name}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleEvent(
                          event.id
                        )
                      }
                      className="text-left transition hover:text-zinc-300"
                    >
                      <p className="text-xs text-zinc-500">
                        Client
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {event.clientName}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleEvent(
                          event.id
                        )
                      }
                      className="text-left transition hover:text-zinc-300"
                    >
                      <p className="text-xs text-zinc-500">
                        Category
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {event.eventType}
                      </p>
                    </button>

                    <div className="relative flex items-center justify-end gap-2">
                      {isExternal && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(
                              e
                            ) => {
                              e.stopPropagation();

                              setOpenExternalMenuId(
                                isMenuOpen
                                  ? null
                                  : event.id
                              );
                            }}
                            className={`rounded-lg border p-2 transition-all duration-200 ${
                              isMenuOpen
                                ? "border-zinc-500 bg-zinc-800 text-white"
                                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
                            }`}
                            aria-label="External event options"
                            aria-expanded={
                              isMenuOpen
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-full z-40 mt-2 w-32 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 p-1.5 shadow-2xl shadow-black/40">
                              <button
                                type="button"
                                onClick={(
                                  e
                                ) => {
                                  e.stopPropagation();

                                  openEditExternalModal(
                                    event
                                  );
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                              >
                                <Pencil className="h-4 w-4" />

                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={(
                                  e
                                ) => {
                                  e.stopPropagation();

                                  handleDeleteExternalEvent(
                                    event
                                  );
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-red-500/10 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />

                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          toggleEvent(
                            event.id
                          )
                        }
                        className="rounded-lg p-1.5 transition hover:bg-zinc-800"
                        aria-label={
                          isExpanded
                            ? "Collapse event"
                            : "Expand event"
                        }
                      >
                        <ChevronDown
                          className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${
                            isExpanded
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800 px-5 pb-5 pt-5">
                      {isExternal ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                              {event.email ||
                                "—"}
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
                              Hard Disk Name
                            </p>

                            <p className="mt-1 text-sm font-medium text-zinc-200">
                              {event.hardDiskName ||
                                "—"}
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

                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs text-zinc-500">
                              Description
                            </p>

                            <p className="mt-1 text-sm font-medium text-zinc-200">
                              {event.description ||
                                "—"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                              {event.email ||
                                "—"}
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

                          <div className="sm:col-span-2 lg:col-span-4">
                            <p className="text-xs text-zinc-500">
                              Folders
                            </p>

                            <div className="mt-2 space-y-2">
                              {event.folders.length ===
                              0 ? (
                                <p className="text-sm font-medium text-zinc-200">
                                  No folders
                                </p>
                              ) : (
                                event.folders.map(
                                  (
                                    folder
                                  ) => (
                                    <div
                                      key={
                                        folder.id
                                      }
                                      className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3"
                                    >
                                      <p className="text-sm font-semibold text-white">
                                        {
                                          folder.name
                                        }
                                      </p>

                                      <p className="mt-1 text-xs text-zinc-500">
                                        Hard Disk Name:{" "}
                                        <span className="text-zinc-300">
                                          {folder.hardDiskName ||
                                            "—"}
                                        </span>
                                      </p>
                                    </div>
                                  )
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
              disabled={
                safeCurrentPage === 1
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              ←
            </button>

            <span className="text-sm text-zinc-400">
              Page {safeCurrentPage} of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
              disabled={
                safeCurrentPage ===
                totalPages
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              →
            </button>
          </div>
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
                  setShowViewFilter(
                    false
                  )
                }
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-white">
                  Source
                </h3>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["all", "All"],
                    ["picknovate", "Picknnovate"],
                    ["external", "External"],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setSourceFilter(
                            value as SourceFilter
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-sm transition-all duration-200 ${
                          sourceFilter ===
                          value
                            ? "border-white bg-white text-black hover:bg-zinc-200"
                            : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  ["all", "All Past Events"],
                  ["event", "Specific Event"],
                  ["date", "Specific Date"],
                  ["range", "Date Range"],
                  ["month", "Month"],
                  ["category", "Category"],
                  ["hardDisk", "Hard Disk"],
                ].map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setViewFilterType(
                          value as ViewFilterType
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm transition ${
                        viewFilterType ===
                        value
                          ? "border-white bg-white text-black hover:bg-zinc-200"
                          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>

              <div className="mt-5">
                {viewFilterType ===
                  "event" && (
                  <select
                    value={
                      viewSelectedEventId
                    }
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

                    {events
                      .filter(
                        (event) =>
                          sourceFilter ===
                            "all" ||
                          event.source ===
                            sourceFilter
                      )
                      .map(
                        (event) => (
                          <option
                            key={
                              event.id
                            }
                            value={
                              event.id
                            }
                          >
                            {event.name} —{" "}
                            {
                              event.clientName
                            }
                          </option>
                        )
                      )}
                  </select>
                )}

                {viewFilterType ===
                  "date" && (
                  <input
                    type="date"
                    value={
                      viewSelectedDate
                    }
                    onChange={(e) =>
                      setViewSelectedDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                  />
                )}

                {viewFilterType ===
                  "range" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs text-zinc-500">
                        From
                      </label>

                      <input
                        type="date"
                        value={
                          viewStartDate
                        }
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
                        value={
                          viewEndDate
                        }
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

                {viewFilterType ===
                  "month" && (
                  <div>
                    <label className="mb-2 block text-xs text-zinc-500">
                      Event Month
                    </label>

                    <input
                      type="month"
                      value={
                        viewSelectedMonth
                      }
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

                {viewFilterType ===
                  "category" && (
                  <select
                    value={
                      viewSelectedCategory
                    }
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

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                )}

                {viewFilterType ===
                  "hardDisk" && (
                  <select
                    value={
                      viewSelectedHardDisk
                    }
                    onChange={(e) =>
                      setViewSelectedHardDisk(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="">
                      Select a hard disk
                    </option>

                    {allHardDisks.map(
                      (hardDisk) => (
                        <option
                          key={
                            hardDisk
                          }
                          value={
                            hardDisk
                          }
                        >
                          {hardDisk}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowViewFilter(
                    false
                  )
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowViewFilter(
                    false
                  )
                }
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition-all hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-lg"
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
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Download Summary
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Choose the events and details to include in your PDF.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDownloadModal(
                    false
                  )
                }
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Source
                </h3>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["all", "All"],
                    ["picknovate", "Picknnovate"],
                    ["external", "External"],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setPdfSourceFilter(
                            value as SourceFilter
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-sm transition-all duration-200 ${
                          pdfSourceFilter ===
                          value
                            ? "border-white bg-white text-black hover:bg-zinc-200"
                            : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="mt-8">
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
                    ["hardDisk", "Hard Disk"],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setFilterType(
                            value as FilterType
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-sm transition ${
                          filterType ===
                          value
                            ? "border-white bg-white text-black hover:bg-zinc-200"
                            : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5">
                {filterType ===
                  "event" && (
                  <select
                    value={
                      selectedEventId
                    }
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

                    {events
                      .filter(
                        (event) =>
                          pdfSourceFilter ===
                            "all" ||
                          event.source ===
                            pdfSourceFilter
                      )
                      .map(
                        (event) => (
                          <option
                            key={
                              event.id
                            }
                            value={
                              event.id
                            }
                          >
                            {event.name} —{" "}
                            {
                              event.clientName
                            }
                          </option>
                        )
                      )}
                  </select>
                )}

                {filterType ===
                  "date" && (
                  <input
                    type="date"
                    value={
                      selectedDate
                    }
                    onChange={(e) =>
                      setSelectedDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark]"
                  />
                )}

                {filterType ===
                  "range" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs text-zinc-500">
                        From
                      </label>

                      <input
                        type="date"
                        value={
                          startDate
                        }
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
                        value={
                          endDate
                        }
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

                {filterType ===
                  "month" && (
                  <div>
                    <label className="mb-2 block text-xs text-zinc-500">
                      Event Month
                    </label>

                    <input
                      type="month"
                      value={
                        selectedMonth
                      }
                      onChange={(e) =>
                        setSelectedMonth(
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

                {filterType ===
                  "category" && (
                  <select
                    value={
                      selectedCategory
                    }
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

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                )}

                {filterType ===
                  "hardDisk" && (
                  <select
                    value={
                      selectedHardDisk
                    }
                    onChange={(e) =>
                      setSelectedHardDisk(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="">
                      Select a hard disk
                    </option>

                    {allHardDisks.map(
                      (hardDisk) => (
                        <option
                          key={
                            hardDisk
                          }
                          value={
                            hardDisk
                          }
                        >
                          {hardDisk}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-white">
                  Include in PDF
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PDF_FIELDS.map(
                    (field) => (
                      <label
                        key={
                          field.key
                        }
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
                    )
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-white">
                  Sort PDF
                </h3>

                <select
                  value={
                    sortType
                  }
                  onChange={(e) =>
                    setSortType(
                      e.target
                        .value as SortType
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

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowDownloadModal(
                    false
                  )
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={downloadPdf}
                disabled={
                  selectedFields.length ===
                  0
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition-all hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-4 w-4" />

                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Event Modal */}
      {showExternalModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={
              handleExternalFormSubmit
            }
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {editingExternalEvent
                    ? "Edit External Event"
                    : "Add External Event"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {editingExternalEvent
                    ? "Update the external event details."
                    : "Add a simple event record without creating a Picknovate gallery."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeExternalModal
                }
                disabled={
                  isSavingExternal
                }
                className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6">
              {externalActionError && (
                <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-red-300">
                      {
                        externalActionError
                      }
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setExternalActionError(
                          ""
                        )
                      }
                      className="shrink-0 rounded-md p-1 text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                      aria-label="Close error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Client Name */}
                <div>
                  <label className="mb-2 block text-xs text-zinc-500">
                    Client Name *
                  </label>

                  <input
                    ref={clientNameRef}
                    type="text"
                    value={
                      externalForm.clientName
                    }
                    onChange={(e) =>
                      updateExternalForm(
                        "clientName",
                        e.target.value
                      )
                    }
                    placeholder="Client name"
                    aria-invalid={Boolean(
                      externalFieldErrors.clientName
                    )}
                    className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white ${
                      externalFieldErrors.clientName
                        ? "border-red-500/70"
                        : "border-zinc-800"
                    }`}
                  />

                  {externalFieldErrors.clientName && (
                    <p className="mt-2 text-xs text-red-400">
                      {
                        externalFieldErrors.clientName
                      }
                    </p>
                  )}
                </div>

                {/* Event Name */}
                <div>
                  <label className="mb-2 block text-xs text-zinc-500">
                    Event Name *
                  </label>

                  <input
                    ref={eventNameRef}
                    type="text"
                    value={
                      externalForm.name
                    }
                    onChange={(e) =>
                      updateExternalForm(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Event name"
                    aria-invalid={Boolean(
                      externalFieldErrors.name
                    )}
                    className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white ${
                      externalFieldErrors.name
                        ? "border-red-500/70"
                        : "border-zinc-800"
                    }`}
                  />

                  {externalFieldErrors.name && (
                    <p className="mt-2 text-xs text-red-400">
                      {
                        externalFieldErrors.name
                      }
                    </p>
                  )}
                </div>

                {/* Event Category */}
                <div>
                  <label className="mb-2 block text-xs text-zinc-500">
                    Event Category *
                  </label>

                  <select
                    ref={
                      eventCategoryRef
                    }
                    value={
                      externalForm.eventCategory
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      updateExternalForm(
                        "eventCategory",
                        value
                      );

                      if (
                        value !==
                        "Other"
                      ) {
                        updateExternalForm(
                          "customEventCategory",
                          ""
                        );
                      }
                    }}
                    aria-invalid={Boolean(
                      externalFieldErrors.eventCategory
                    )}
                    className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white ${
                      externalFieldErrors.eventCategory
                        ? "border-red-500/70"
                        : "border-zinc-800"
                    }`}
                  >
                    <option
                      value=""
                      disabled
                    >
                      Select event category
                    </option>

                    {EVENT_CATEGORIES.map(
                      (category) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>

                  {externalFieldErrors.eventCategory && (
                    <p className="mt-2 text-xs text-red-400">
                      {
                        externalFieldErrors.eventCategory
                      }
                    </p>
                  )}
                </div>

                {/* Event Date */}
                <div>
                  <label className="mb-2 block text-xs text-zinc-500">
                    Event Date *
                  </label>

                  <input
                    ref={eventDateRef}
                    type="date"
                    value={
                      externalForm.eventDate
                    }
                    onChange={(e) =>
                      updateExternalForm(
                        "eventDate",
                        e.target.value
                      )
                    }
                    aria-invalid={Boolean(
                      externalFieldErrors.eventDate
                    )}
                    className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-white [color-scheme:dark] ${
                      externalFieldErrors.eventDate
                        ? "border-red-500/70"
                        : "border-zinc-800"
                    }`}
                  />

                  {externalFieldErrors.eventDate && (
                    <p className="mt-2 text-xs text-red-400">
                      {
                        externalFieldErrors.eventDate
                      }
                    </p>
                  )}
                </div>

                {/* Custom Event Category */}
                {externalForm.eventCategory ===
                  "Other" && (
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs text-amber-400">
                      Custom Event Category *
                    </label>

                    <input
                      ref={
                        customEventCategoryRef
                      }
                      type="text"
                      value={
                        externalForm.customEventCategory
                      }
                      onChange={(e) =>
                        updateExternalForm(
                          "customEventCategory",
                          e.target.value
                        )
                      }
                      placeholder="Please specify your event category"
                      aria-invalid={Boolean(
                        externalFieldErrors.customEventCategory
                      )}
                      className={`w-full rounded-xl border bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-400 ${
                        externalFieldErrors.customEventCategory
                          ? "border-red-500/70"
                          : "border-amber-400/30"
                      }`}
                    />

                    {externalFieldErrors.customEventCategory && (
                      <p className="mt-2 text-xs text-red-400">
                        {
                          externalFieldErrors.customEventCategory
                        }
                      </p>
                    )}
                  </div>
                )}

                {/* Phone Number */}
                <div>
                  <label className="mb-2 block text-xs text-zinc-500">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={
                      externalForm.phoneNumber
                    }
                    onChange={(e) =>
                      updateExternalForm(
                        "phoneNumber",
                        e.target.value
                      )
                    }
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs text-zinc-500">
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      externalForm.email
                    }
                    onChange={(e) =>
                      updateExternalForm(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="Email address"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
                  />
                </div>

                {/* Hard Disk Name */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs text-zinc-500">
                    Hard Disk Name
                  </label>

                  <input
                    type="text"
                    value={
                      externalForm.hardDiskName
                    }
                    onChange={(e) =>
                      updateExternalForm(
                        "hardDiskName",
                        e.target.value
                      )
                    }
                    placeholder="Hard disk name"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs text-zinc-500">
                    Description
                  </label>

                  <textarea
                    value={
                      externalForm.description
                    }
                    onChange={(e) =>
                      updateExternalForm(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Optional description"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  closeExternalModal
                }
                disabled={
                  isSavingExternal
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSavingExternal
                }
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition-all hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingExternal
                  ? "Saving..."
                  : editingExternalEvent
                    ? "Save Changes"
                    : "Add External Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationEvent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Delete External Event?
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-zinc-200">
                    "{deleteConfirmationEvent.name}"
                  </span>
                  ?
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  This External Event will be permanently removed from the database.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  cancelDeleteExternalEvent
                }
                disabled={
                  Boolean(
                    deletingExternalId
                  )
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmDeleteExternalEvent
                }
                disabled={
                  Boolean(
                    deletingExternalId
                  )
                }
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-red-400 hover:shadow-lg hover:shadow-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingExternalId
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Action Error Modal */}
      {externalActionError &&
        !showExternalModal &&
        !deleteConfirmationEvent && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white">
                Something went wrong
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {externalActionError}
              </p>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setExternalActionError(
                      ""
                    )
                  }
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-lg"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}