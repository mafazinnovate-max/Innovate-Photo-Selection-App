"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

/* =========================================
   Logo crop constants
========================================= */

/*
 * Offsets (X / Y) are stored in a fixed 176px "reference circle"
 * (the original editor size), so the saved values stay the same
 * no matter how large the circle is on the current screen.
 */
const REF_SIZE = 176;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/*
 * How far the image centre may be moved from the circle centre.
 * Grows with zoom so a zoomed-in image can be panned to its edges,
 * while some part of the image always stays inside the circle.
 */
const clampOffset = (value: number, zoom: number) => {
  const max = (REF_SIZE / 2) * Math.max(1, zoom);
  return clamp(value, -max, max);
};

type LogoTransform = {
  zoom: number;
  x: number;
  y: number;
};

type Gesture =
  | { mode: "none" }
  | {
      mode: "drag";
      id: number;
      startClientX: number;
      startClientY: number;
      originX: number;
      originY: number;
    }
  | {
      mode: "pinch";
      ids: [number, number];
      startDistance: number;
      startZoom: number;
      startMidX: number;
      startMidY: number;
      originX: number;
      originY: number;
    };

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* -----------------------------
     Studio Profile
  ----------------------------- */

  const [studioName, setStudioName] = useState(
    "Innovate Wedding Company"
  );

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  /* -----------------------------
     Branding: Applied Logo
     (the logo currently active in the Sidebar)
  ----------------------------- */

  const [appliedLogo, setAppliedLogo] = useState<string | null>(null);
  const [appliedZoom, setAppliedZoom] = useState(1);
  const [appliedPositionX, setAppliedPositionX] = useState(0);
  const [appliedPositionY, setAppliedPositionY] = useState(0);

  /* -----------------------------
     Branding: Pending Logo
     (newly uploaded, being positioned, NOT yet applied)
  ----------------------------- */

  const [pendingLogo, setPendingLogo] = useState<string | null>(null);
  const [pendingPublicId, setPendingPublicId] = useState<string | null>(
    null
  );
  const [pendingZoom, setPendingZoom] = useState(1);
  const [pendingPositionX, setPendingPositionX] = useState(0);
  const [pendingPositionY, setPendingPositionY] = useState(0);

  /* -----------------------------
     Branding: Upload UI state
  ----------------------------- */

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [logoSuccess, setLogoSuccess] = useState("");

  const [welcomeMessage, setWelcomeMessage] = useState(
    "Welcome to your private photo gallery."
  );

  /*
   * Editing mode exists only while a newly uploaded
   * (pending) logo is waiting to be applied.
   */
  const isEditingLogo = pendingLogo !== null;

  /*
   * What the circular area shows:
   * - editing mode  -> the pending logo with its crop transform
   * - otherwise     -> the applied logo with its saved transform
   */
  const displayedLogo = isEditingLogo ? pendingLogo : appliedLogo;
  const displayedZoom = isEditingLogo ? pendingZoom : appliedZoom;
  const displayedPositionX = isEditingLogo
    ? pendingPositionX
    : appliedPositionX;
  const displayedPositionY = isEditingLogo
    ? pendingPositionY
    : appliedPositionY;

  /* -----------------------------
     Crop editor internals
  ----------------------------- */

  const cropRef = useRef<HTMLDivElement | null>(null);

  /* Rendered width of the circle in px (responsive) */
  const [cropSize, setCropSize] = useState(REF_SIZE);

  /* True while the user is dragging / pinching */
  const [isDragging, setIsDragging] = useState(false);

  /*
   * Always-current copy of the pending transform, so rapid
   * pointer / wheel events never read a stale React state value.
   */
  const transformRef = useRef<LogoTransform>({ zoom: 1, x: 0, y: 0 });

  /* Active pointers (mouse = 1, touch = 1 or 2) */
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );

  const gestureRef = useRef<Gesture>({ mode: "none" });

  /* Single place that updates the pending crop transform */
  const commitPendingTransform = useCallback(
    (zoom: number, x: number, y: number) => {
      transformRef.current = { zoom, x, y };
      setPendingZoom(zoom);
      setPendingPositionX(x);
      setPendingPositionY(y);
    },
    []
  );

  /* -----------------------------
     Gallery Settings
  ----------------------------- */

  const [allowComments, setAllowComments] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(false);
  const [showSelectionCount, setShowSelectionCount] = useState(true);
  const [allowReselection, setAllowReselection] = useState(true);
  const [showFilenames, setShowFilenames] = useState(false);

  /* -----------------------------
     Notifications
  ----------------------------- */

  const [selectionNotification, setSelectionNotification] =
    useState(true);

  const [commentNotification, setCommentNotification] =
    useState(true);

  /* -----------------------------
     UI State
  ----------------------------- */

  const [saved, setSaved] = useState(false);

  /* -----------------------------
     Load Existing Applied Logo
     (loaded as APPLIED only, never as pending)
  ----------------------------- */

useEffect(() => {
  const loadLogo = async () => {
    try {
      const response = await fetch("/api/upload-logo", {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedLogo(data.logoUrl);
      }
    } catch (error) {
      console.error("Failed to load studio logo:", error);
    }
  };

  loadLogo();

  const savedZoom = localStorage.getItem("studioLogoZoom");
  const savedPositionX = localStorage.getItem("studioLogoPositionX");
  const savedPositionY = localStorage.getItem("studioLogoPositionY");

  if (savedZoom) setAppliedZoom(Number(savedZoom));
  if (savedPositionX) setAppliedPositionX(Number(savedPositionX));
  if (savedPositionY) setAppliedPositionY(Number(savedPositionY));
}, []);

  /* -----------------------------
     Track the circle's rendered size
     (so the stored reference-space offsets render correctly
     at every screen size)
  ----------------------------- */

  useEffect(() => {
    const element = cropRef.current;

    if (!element) return;

    const updateSize = () => {
      setCropSize(element.clientWidth || REF_SIZE);
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);

      return () => {
        window.removeEventListener("resize", updateSize);
      };
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* -----------------------------
     Clear gesture state when leaving editing mode
  ----------------------------- */

  useEffect(() => {
    if (!isEditingLogo) {
      pointersRef.current.clear();
      gestureRef.current = { mode: "none" };
      setIsDragging(false);
    }
  }, [isEditingLogo]);

  /* -----------------------------
     Mouse wheel / trackpad pinch = zoom
     (native non-passive listener so the page
     does not scroll while zooming the crop)
  ----------------------------- */

  useEffect(() => {
    const element = cropRef.current;

    if (!element || !isEditingLogo) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const rect = element.getBoundingClientRect();
      const size = element.clientWidth || REF_SIZE;
      const k = REF_SIZE / size;

      /* Cursor position relative to circle centre, in reference units */
      const focalX = (event.clientX - (rect.left + rect.width / 2)) * k;
      const focalY = (event.clientY - (rect.top + rect.height / 2)) * k;

      let delta = event.deltaY;

      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= rect.height;

      /* Trackpad pinch arrives as ctrl+wheel with small deltas */
      const sensitivity = event.ctrlKey ? 0.01 : 0.0015;

      const current = transformRef.current;
      const nextZoom = clamp(
        current.zoom * Math.exp(-delta * sensitivity),
        MIN_ZOOM,
        MAX_ZOOM
      );

      if (nextZoom === current.zoom) return;

      /* Keep the image point under the cursor fixed while zooming */
      const ratio = nextZoom / current.zoom;
      const nextX = focalX - (focalX - current.x) * ratio;
      const nextY = focalY - (focalY - current.y) * ratio;

      commitPendingTransform(
        nextZoom,
        clampOffset(nextX, nextZoom),
        clampOffset(nextY, nextZoom)
      );
    };

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [isEditingLogo, commitPendingTransform]);

  /* -----------------------------
     Pointer gestures: drag + pinch
  ----------------------------- */

  /* Converts a client point to reference units relative to circle centre */
  const toCropSpace = (clientX: number, clientY: number) => {
    const element = cropRef.current;

    if (!element) return { x: 0, y: 0 };

    const rect = element.getBoundingClientRect();
    const size = element.clientWidth || REF_SIZE;
    const k = REF_SIZE / size;

    return {
      x: (clientX - (rect.left + rect.width / 2)) * k,
      y: (clientY - (rect.top + rect.height / 2)) * k,
    };
  };

  /*
   * Re-reads the active pointers and starts the right gesture
   * from the CURRENT transform. Called whenever a pointer is
   * added or removed, so going from 2 fingers to 1 continues
   * smoothly as a drag instead of jumping.
   */
  const rebaselineGesture = () => {
    const pointers = Array.from(pointersRef.current.entries());
    const current = transformRef.current;

    if (pointers.length === 0) {
      gestureRef.current = { mode: "none" };
      return;
    }

    if (pointers.length === 1) {
      const [id, point] = pointers[0];

      gestureRef.current = {
        mode: "drag",
        id,
        startClientX: point.x,
        startClientY: point.y,
        originX: current.x,
        originY: current.y,
      };
      return;
    }

    const [idA, a] = pointers[0];
    const [idB, b] = pointers[1];

    const midClientX = (a.x + b.x) / 2;
    const midClientY = (a.y + b.y) / 2;
    const mid = toCropSpace(midClientX, midClientY);

    gestureRef.current = {
      mode: "pinch",
      ids: [idA, idB],
      startDistance: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1),
      startZoom: current.zoom,
      startMidX: mid.x,
      startMidY: mid.y,
      originX: current.x,
      originY: current.y,
    };
  };

  const applyGesture = () => {
    const gesture = gestureRef.current;
    const element = cropRef.current;

    if (!element || gesture.mode === "none") return;

    const size = element.clientWidth || REF_SIZE;
    const k = REF_SIZE / size;

    if (gesture.mode === "drag") {
      const point = pointersRef.current.get(gesture.id);

      if (!point) return;

      const zoom = transformRef.current.zoom;

      const nextX =
        gesture.originX + (point.x - gesture.startClientX) * k;
      const nextY =
        gesture.originY + (point.y - gesture.startClientY) * k;

      commitPendingTransform(
        zoom,
        clampOffset(nextX, zoom),
        clampOffset(nextY, zoom)
      );
      return;
    }

    /* Pinch: zoom and pan together */
    const a = pointersRef.current.get(gesture.ids[0]);
    const b = pointersRef.current.get(gesture.ids[1]);

    if (!a || !b) return;

    const distance = Math.hypot(a.x - b.x, a.y - b.y);

    const nextZoom = clamp(
      gesture.startZoom * (distance / gesture.startDistance),
      MIN_ZOOM,
      MAX_ZOOM
    );

    const mid = toCropSpace((a.x + b.x) / 2, (a.y + b.y) / 2);

    /*
     * The image point that was under the fingers' midpoint when the
     * pinch started stays under the (moving) midpoint.
     */
    const imagePointX =
      (gesture.startMidX - gesture.originX) / gesture.startZoom;
    const imagePointY =
      (gesture.startMidY - gesture.originY) / gesture.startZoom;

    const nextX = mid.x - nextZoom * imagePointX;
    const nextY = mid.y - nextZoom * imagePointY;

    commitPendingTransform(
      nextZoom,
      clampOffset(nextX, nextZoom),
      clampOffset(nextY, nextZoom)
    );
  };

  const handleCropPointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isEditingLogo) return;

    /* Mouse: primary button only */
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.preventDefault();

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Pointer may already be gone; safe to ignore */
    }

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    rebaselineGesture();
    setIsDragging(true);
  };

  const handleCropPointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!pointersRef.current.has(event.pointerId)) return;

    event.preventDefault();

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    applyGesture();
  };

  const handleCropPointerEnd = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!pointersRef.current.has(event.pointerId)) return;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* Capture may already be released; safe to ignore */
    }

    pointersRef.current.delete(event.pointerId);

    rebaselineGesture();

    if (pointersRef.current.size === 0) {
      setIsDragging(false);
    }
  };

  /* -----------------------------
     Logo Upload -> becomes PENDING logo
  ----------------------------- */

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setLogoError("");
    setLogoSuccess("");
    setSaved(false);

    if (!file.type.startsWith("image/")) {
      setLogoError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Logo must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logo upload failed.");
      }

      /*
       * The uploaded image becomes the PENDING logo only.
       *
       * - The applied logo is not touched.
       * - localStorage is not touched.
       * - The Sidebar is not notified.
       *
       * If a previous pending logo existed, it is replaced.
       */
      setPendingLogo(data.url);
      setPendingPublicId(data.publicId);

      /* Every new pending logo starts centred at default zoom */
      commitPendingTransform(1, 0, 0);

      setLogoSuccess("");
    } catch (error) {
      console.error(error);

      setLogoError(
        error instanceof Error ? error.message : "Logo upload failed."
      );
    } finally {
      setUploadingLogo(false);

      /* Allow selecting the same file again later */
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /* -----------------------------
     Apply Logo
     Pending -> Applied (final confirmation)
  ----------------------------- */

  const applyLogo = () => {
    if (!pendingLogo) return;

    /* Save URL + crop transform as the active studio logo */
    localStorage.setItem("studioLogo", pendingLogo);
    localStorage.setItem("studioLogoZoom", String(pendingZoom));
    localStorage.setItem(
      "studioLogoPositionX",
      String(pendingPositionX)
    );
    localStorage.setItem(
      "studioLogoPositionY",
      String(pendingPositionY)
    );

    /* Pending becomes applied */
    setAppliedLogo(pendingLogo);
    setAppliedZoom(pendingZoom);
    setAppliedPositionX(pendingPositionX);
    setAppliedPositionY(pendingPositionY);

    /* Leave editing mode */
    setPendingLogo(null);
    setPendingPublicId(null);
    commitPendingTransform(1, 0, 0);

    /* Tell the Sidebar the applied logo changed */
    window.dispatchEvent(new Event("studio-logo-changed"));

    setLogoError("");
    setLogoSuccess("Logo applied successfully.");
    setSaved(false);
  };

  /* -----------------------------
     Cancel Editing
     Discards the pending logo; applied logo stays active
  ----------------------------- */

  const cancelLogoEditing = () => {
    setPendingLogo(null);
    setPendingPublicId(null);
    commitPendingTransform(1, 0, 0);

    setLogoError("");
    setLogoSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* -----------------------------
     Remove Applied Logo
  ----------------------------- */

  const removeLogo = () => {
    setAppliedLogo(null);
    setAppliedZoom(1);
    setAppliedPositionX(0);
    setAppliedPositionY(0);

    setLogoError("");
    setLogoSuccess("");

    localStorage.removeItem("studioLogo");
    localStorage.removeItem("studioLogoZoom");
    localStorage.removeItem("studioLogoPositionX");
    localStorage.removeItem("studioLogoPositionY");

    window.dispatchEvent(new Event("studio-logo-changed"));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSaved(false);
  };

  /* -----------------------------
     Save
  ----------------------------- */

  const handleSave = () => {
    /*
     * This currently saves the values only in the
     * React state for this page.
     *
     * Database persistence will be connected later.
     */

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* Reference-space offsets -> pixels at the current circle size */
  const cropScale = cropSize / REF_SIZE;

  return (
    <div className="space-y-8">
      {/* --------------------------------
          Header
      -------------------------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-400">
            Configuration
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Manage your studio, branding, gallery and notification
            preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}

          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {/* --------------------------------
          1. Studio Profile
      -------------------------------- */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Studio Profile
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Manage the information associated with your studio.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="studioName"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Studio Name
            </label>

            <input
              id="studioName"
              type="text"
              value={studioName}
              onChange={(e) => {
                setStudioName(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              placeholder="Enter studio name"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Mail size={15} />
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
                placeholder="studio@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Phone size={15} />
                Phone
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="website"
              className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
            >
              <Globe size={15} />
              Website
            </label>

            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              placeholder="https://yourstudio.com"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="instagram"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Globe size={15} />
                Instagram
              </label>

              <input
                id="instagram"
                type="url"
                value={instagram}
                onChange={(e) => {
                  setInstagram(e.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
                placeholder="https://instagram.com/yourstudio"
              />
            </div>

            <div>
              <label
                htmlFor="whatsapp"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <MessageCircle size={15} />
                WhatsApp
              </label>

              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Studio Address
            </label>

            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setSaved(false);
              }}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              placeholder="Enter your studio address"
            />
          </div>
        </div>
      </section>

      {/* --------------------------------
          2. Branding
      -------------------------------- */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6" id="branding">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Branding
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Customize the appearance of your client galleries.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] 2xl:grid-cols-[320px_1fr]">
          {/* Logo editor */}

          <div className="w-full">
            <div className="mb-3 flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-zinc-300">
                Studio Logo
              </label>

              {isEditingLogo && (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                  Editing new logo
                </span>
              )}
            </div>

            {/* --------------------------------
                Circular crop area.
                The circle is fixed; the image moves
                inside it and is clipped by it.
            -------------------------------- */}

            <div className="flex w-full justify-center lg:justify-start">
              <div
                ref={cropRef}
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerEnd}
                onPointerCancel={handleCropPointerEnd}
                onLostPointerCapture={handleCropPointerEnd}
                onContextMenu={(e) => {
                  if (isEditingLogo) e.preventDefault();
                }}
                aria-label={
                  isEditingLogo
                    ? "Logo crop area. Drag to move, scroll or pinch to zoom."
                    : "Studio logo"
                }
                className={`relative flex aspect-square h-56 w-56 shrink-0 select-none items-center justify-center overflow-hidden rounded-full border bg-zinc-950 shadow-lg sm:h-60 sm:w-60 2xl:h-72 2xl:w-72 ${
                  isEditingLogo
                    ? `touch-none border-amber-500/60 ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                      }`
                    : "border-zinc-700"
                }`}
                style={{ borderRadius: "9999px" }}
              >
                {displayedLogo ? (
                  <img
                    src={displayedLogo}
                    alt={
                      isEditingLogo
                        ? "New studio logo being positioned"
                        : "Studio logo"
                    }
                    draggable={false}
                    className="pointer-events-none h-full w-full select-none object-contain p-[9%] will-change-transform"
                    style={{
                      transform: `translate(${
                        displayedPositionX * cropScale
                      }px, ${
                        displayedPositionY * cropScale
                      }px) scale(${displayedZoom})`,
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 rounded-xl bg-zinc-800 p-3">
                      <Camera
                        size={24}
                        className="text-zinc-400"
                      />
                    </div>

                    <p className="text-xs text-zinc-500">
                      No logo
                    </p>
                  </div>
                )}

                {/* Thirds grid, visible only while dragging */}
                {isEditingLogo && (
                  <div
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${
                      isDragging ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white/25" />
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white/25" />
                    <div className="absolute left-0 top-1/3 h-px w-full bg-white/25" />
                    <div className="absolute left-0 top-2/3 h-px w-full bg-white/25" />
                  </div>
                )}
              </div>
            </div>

            {/* Hidden input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />

            {/* Upload / Remove */}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={16} />

                {uploadingLogo
                  ? "Uploading..."
                  : isEditingLogo || appliedLogo
                    ? "Change Logo"
                    : "Upload Logo"}
              </button>

              {/* Remove applies to the applied logo, outside editing mode */}
              {!isEditingLogo && appliedLogo && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-white"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              )}
            </div>

            {logoError && (
              <p className="mt-2 text-xs text-red-400">
                {logoError}
              </p>
            )}

            {/* --------------------------------
                Editing mode panel.
                No sliders or numeric values:
                the image itself is the control.
            -------------------------------- */}

            {isEditingLogo && (
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-zinc-950/70 p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-white">
                    Position New Logo
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Drag the image to move it. Scroll or pinch to
                    zoom. Your current logo stays active until you
                    click Apply Logo.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={cancelLogoEditing}
                    className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={applyLogo}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
                  >
                    <Check size={14} />
                    Apply Logo
                  </button>
                </div>
              </div>
            )}

            {logoSuccess && (
              <p className="mt-3 text-xs text-emerald-400">
                {logoSuccess}
              </p>
            )}

            <p className="mt-2 text-xs text-zinc-500">
              Maximum 5MB.
            </p>
          </div>

          {/* Welcome message */}

          <div>
            <label
              htmlFor="welcomeMessage"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Gallery Welcome Message
            </label>

            <textarea
              id="welcomeMessage"
              rows={6}
              value={welcomeMessage}
              onChange={(e) => {
                setWelcomeMessage(e.target.value);
                setSaved(false);
              }}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              placeholder="Write a welcome message for your clients..."
            />

            <p className="mt-2 text-xs text-zinc-500">
              This message can be displayed when clients open
              their gallery.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------
          3. Gallery Preferences
      -------------------------------- */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Gallery Preferences
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Control the client photo-selection experience.
          </p>
        </div>

        <div className="divide-y divide-zinc-800">
          <SettingRow
            title="Allow Client Comments"
            description="Allow clients to leave comments on photos."
            enabled={allowComments}
            onChange={() => {
              setAllowComments((value) => !value);
              setSaved(false);
            }}
          />

          <SettingRow
            title="Allow Photo Downloads"
            description="Allow clients to download photos from their gallery."
            enabled={allowDownloads}
            onChange={() => {
              setAllowDownloads((value) => !value);
              setSaved(false);
            }}
          />

          <SettingRow
            title="Show Selection Count"
            description="Show clients how many photos they have selected."
            enabled={showSelectionCount}
            onChange={() => {
              setShowSelectionCount((value) => !value);
              setSaved(false);
            }}
          />

          <SettingRow
            title="Allow Reselection"
            description="Allow clients to change their selected photos before completing the gallery."
            enabled={allowReselection}
            onChange={() => {
              setAllowReselection((value) => !value);
              setSaved(false);
            }}
          />

          <SettingRow
            title="Show File Names"
            description="Display the original photo filename to clients."
            enabled={showFilenames}
            onChange={() => {
              setShowFilenames((value) => !value);
              setSaved(false);
            }}
          />
        </div>
      </section>

      {/* --------------------------------
          4. Notifications
      -------------------------------- */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Notifications
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Choose which client activities should notify your
            studio.
          </p>
        </div>

        <div className="divide-y divide-zinc-800">
          <SettingRow
            title="Selection Completed"
            description="Notify the studio when a client completes their photo selection."
            enabled={selectionNotification}
            onChange={() => {
              setSelectionNotification((value) => !value);
              setSaved(false);
            }}
          />

          <SettingRow
            title="New Photo Comment"
            description="Notify the studio when a client comments on a photo."
            enabled={commentNotification}
            onChange={() => {
              setCommentNotification((value) => !value);
              setSaved(false);
            }}
          />
        </div>
      </section>

      {/* --------------------------------
          Bottom Save
      -------------------------------- */}

      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Settings
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Save your changes before leaving this page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}

          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* =========================================
   Reusable Toggle
========================================= */

type SettingRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
};

function SettingRow({
  title,
  description,
  enabled,
  onChange,
}: SettingRowProps) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="pr-4">
        <h3 className="text-sm font-medium text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-white" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full transition ${
            enabled
              ? "left-6 bg-black"
              : "left-1 bg-zinc-400"
          }`}
        />
      </button>
    </div>
  );
}