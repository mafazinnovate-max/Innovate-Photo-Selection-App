"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

/* =========================================
   Logo crop constants
========================================= */

const REF_SIZE = 176;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");

  /* Super Admin controlled description */
  const [description, setDescription] = useState("");

  /* -----------------------------
     Admin Profile
  ----------------------------- */

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");

  /* -----------------------------
     Settings DB loading / saving
  ----------------------------- */

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  /* -----------------------------
     Settings Edit Lock
  ----------------------------- */

  const [isEditingSettings, setIsEditingSettings] =
    useState(false);

  /* -----------------------------
     Change Password
  ----------------------------- */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

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
  const [savingLogo, setSavingLogo] = useState(false);

  const isEditingLogo = pendingLogo !== null;

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

  const [cropSize, setCropSize] = useState(REF_SIZE);

  const [isDragging, setIsDragging] = useState(false);

  const transformRef = useRef<LogoTransform>({
    zoom: 1,
    x: 0,
    y: 0,
  });

  const pointersRef = useRef<
    Map<number, { x: number; y: number }>
  >(new Map());

  const gestureRef = useRef<Gesture>({ mode: "none" });

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
     UI State
  ----------------------------- */

  const [saved, setSaved] = useState(false);

  /* -----------------------------
     Load Settings From DB
  ----------------------------- */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoadingSettings(true);
        setSettingsError("");

        const response = await fetch("/api/admin/settings", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load settings."
          );
        }

        /* -----------------------------
           Studio data
        ----------------------------- */

        setStudioName(data.studio?.name ?? "");
        setEmail(data.studio?.email ?? "");
        setPhone(data.studio?.phone ?? "");
        setWebsite(data.studio?.website ?? "");
        setAddress(data.studio?.address ?? "");
        setCity(data.studio?.city ?? "");
        setState(data.studio?.state ?? "");
        setCountry(data.studio?.country ?? "India");

        /* Super Admin controlled description */
        setDescription(data.studio?.description ?? "");

        /* -----------------------------
           Admin data
        ----------------------------- */

        setAdminName(data.admin?.name ?? "");
        setAdminEmail(data.admin?.email ?? "");
        setAdminPhone(data.admin?.phone ?? "");
      } catch (error) {
        console.error("Failed to load settings:", error);

        setSettingsError(
          error instanceof Error
            ? error.message
            : "Failed to load settings."
        );
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  /* -----------------------------
     Load Existing Applied Logo
     Including persisted DB transform
  ----------------------------- */

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/api/upload-logo", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setAppliedLogo(data.logoUrl ?? null);

          const dbZoom =
            typeof data.logoZoom === "number"
              ? data.logoZoom
              : 1;

          const dbPositionX =
            typeof data.logoPositionX === "number"
              ? data.logoPositionX
              : 0;

          const dbPositionY =
            typeof data.logoPositionY === "number"
              ? data.logoPositionY
              : 0;

          setAppliedZoom(dbZoom);
          setAppliedPositionX(dbPositionX);
          setAppliedPositionY(dbPositionY);

          /*
           * Keep localStorage synchronized with the
           * database so the existing UI behavior remains intact.
           */
          localStorage.setItem(
            "studioLogoZoom",
            String(dbZoom)
          );

          localStorage.setItem(
            "studioLogoPositionX",
            String(dbPositionX)
          );

          localStorage.setItem(
            "studioLogoPositionY",
            String(dbPositionY)
          );

          if (data.logoUrl) {
            localStorage.setItem(
              "studioLogo",
              data.logoUrl
            );
          }
        }
      } catch (error) {
        console.error("Failed to load studio logo:", error);

        /*
         * Fallback to existing localStorage behavior
         * if the logo API cannot be reached.
         */
        const savedZoom = localStorage.getItem(
          "studioLogoZoom"
        );

        const savedPositionX = localStorage.getItem(
          "studioLogoPositionX"
        );

        const savedPositionY = localStorage.getItem(
          "studioLogoPositionY"
        );

        if (savedZoom) setAppliedZoom(Number(savedZoom));
        if (savedPositionX)
          setAppliedPositionX(Number(savedPositionX));
        if (savedPositionY)
          setAppliedPositionY(Number(savedPositionY));
      }
    };

    loadLogo();
  }, []);

  /* -----------------------------
     Track the circle's rendered size
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
  ----------------------------- */

  useEffect(() => {
    const element = cropRef.current;

    if (!element || !isEditingLogo) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const rect = element.getBoundingClientRect();
      const size = element.clientWidth || REF_SIZE;
      const k = REF_SIZE / size;

      const focalX =
        (event.clientX - (rect.left + rect.width / 2)) * k;

      const focalY =
        (event.clientY - (rect.top + rect.height / 2)) * k;

      let delta = event.deltaY;

      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= rect.height;

      const sensitivity = event.ctrlKey ? 0.01 : 0.0015;

      const current = transformRef.current;

      const nextZoom = clamp(
        current.zoom * Math.exp(-delta * sensitivity),
        MIN_ZOOM,
        MAX_ZOOM
      );

      if (nextZoom === current.zoom) return;

      const ratio = nextZoom / current.zoom;

      const nextX =
        focalX - (focalX - current.x) * ratio;

      const nextY =
        focalY - (focalY - current.y) * ratio;

      commitPendingTransform(
        nextZoom,
        clampOffset(nextX, nextZoom),
        clampOffset(nextY, nextZoom)
      );
    };

    element.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [isEditingLogo, commitPendingTransform]);

  /* -----------------------------
     Pointer gestures: drag + pinch
  ----------------------------- */

  const toCropSpace = (clientX: number, clientY: number) => {
    const element = cropRef.current;

    if (!element) return { x: 0, y: 0 };

    const rect = element.getBoundingClientRect();
    const size = element.clientWidth || REF_SIZE;
    const k = REF_SIZE / size;

    return {
      x:
        (clientX - (rect.left + rect.width / 2)) * k,
      y:
        (clientY - (rect.top + rect.height / 2)) * k,
    };
  };

  const rebaselineGesture = () => {
    const pointers = Array.from(
      pointersRef.current.entries()
    );

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
      startDistance: Math.max(
        Math.hypot(a.x - b.x, a.y - b.y),
        1
      ),
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
        gesture.originX +
        (point.x - gesture.startClientX) * k;

      const nextY =
        gesture.originY +
        (point.y - gesture.startClientY) * k;

      commitPendingTransform(
        zoom,
        clampOffset(nextX, zoom),
        clampOffset(nextY, zoom)
      );

      return;
    }

    const a = pointersRef.current.get(gesture.ids[0]);
    const b = pointersRef.current.get(gesture.ids[1]);

    if (!a || !b) return;

    const distance = Math.hypot(
      a.x - b.x,
      a.y - b.y
    );

    const nextZoom = clamp(
      gesture.startZoom *
        (distance / gesture.startDistance),
      MIN_ZOOM,
      MAX_ZOOM
    );

    const mid = toCropSpace(
      (a.x + b.x) / 2,
      (a.y + b.y) / 2
    );

    const imagePointX =
      (gesture.startMidX - gesture.originX) /
      gesture.startZoom;

    const imagePointY =
      (gesture.startMidY - gesture.originY) /
      gesture.startZoom;

    const nextX =
      mid.x - nextZoom * imagePointX;

    const nextY =
      mid.y - nextZoom * imagePointY;

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

    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {
      /* Safe to ignore */
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
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      /* Safe to ignore */
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
        throw new Error(
          data.message || "Logo upload failed."
        );
      }

      setPendingLogo(data.url);
      setPendingPublicId(data.publicId);

      commitPendingTransform(1, 0, 0);

      setLogoSuccess("");
    } catch (error) {
      console.error(error);

      setLogoError(
        error instanceof Error
          ? error.message
          : "Logo upload failed."
      );
    } finally {
      setUploadingLogo(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /* -----------------------------
     Apply Logo
     Pending -> Applied
  ----------------------------- */

  const applyLogo = async () => {
    if (!pendingLogo || savingLogo) return;

    try {
      setSavingLogo(true);
      setLogoError("");
      setLogoSuccess("");

      const response = await fetch("/api/upload-logo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  zoom: pendingZoom,
  positionX: pendingPositionX,
  positionY: pendingPositionY,
}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save logo adjustment."
        );
      }

      localStorage.setItem("studioLogo", pendingLogo);

      localStorage.setItem(
        "studioLogoZoom",
        String(pendingZoom)
      );

      localStorage.setItem(
        "studioLogoPositionX",
        String(pendingPositionX)
      );

      localStorage.setItem(
        "studioLogoPositionY",
        String(pendingPositionY)
      );

      setAppliedLogo(pendingLogo);
      setAppliedZoom(pendingZoom);
      setAppliedPositionX(pendingPositionX);
      setAppliedPositionY(pendingPositionY);

      setPendingLogo(null);
      setPendingPublicId(null);

      commitPendingTransform(1, 0, 0);

      window.dispatchEvent(
        new Event("studio-logo-changed")
      );

      setLogoSuccess("Logo applied successfully.");
      setSaved(false);
    } catch (error) {
      console.error("Failed to save logo adjustment:", error);

      setLogoError(
        error instanceof Error
          ? error.message
          : "Failed to save logo adjustment."
      );
    } finally {
      setSavingLogo(false);
    }
  };

  /* -----------------------------
     Cancel Editing
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

    window.dispatchEvent(
      new Event("studio-logo-changed")
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSaved(false);
  };

  /* -----------------------------
     Enable Settings Editing
  ----------------------------- */

  const handleChangeSettings = () => {
    setIsEditingSettings(true);
    setSaved(false);
    setSettingsError("");
  };

    const handleSettingsKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" &&
      isEditingSettings &&
      !savingSettings
    ) {
      event.preventDefault();
      handleSave();
    }
  };

  /* -----------------------------
     Save Studio + Admin Settings To DB
  ----------------------------- */

  const handleSave = async () => {
    if (!isEditingSettings) return;

    try {
      setSavingSettings(true);
      setSettingsError("");
      setSaved(false);

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studioName,
          email,
          phone,
          website,
          address,
          city,
          state,
          country,
          adminName,
          adminEmail,
          adminPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save settings."
        );
      }

      /* -----------------------------
         Update Studio values
      ----------------------------- */

      setStudioName(data.studio?.name ?? "");
      setEmail(data.studio?.email ?? "");
      setPhone(data.studio?.phone ?? "");
      setWebsite(data.studio?.website ?? "");
      setAddress(data.studio?.address ?? "");
      setCity(data.studio?.city ?? "");
      setState(data.studio?.state ?? "");
      setCountry(data.studio?.country ?? "India");

      /* Super Admin controlled description */
      setDescription(data.studio?.description ?? "");

      /* -----------------------------
         Update Admin values
      ----------------------------- */

      setAdminName(data.admin?.name ?? "");
      setAdminEmail(data.admin?.email ?? "");
      setAdminPhone(data.admin?.phone ?? "");

      setSaved(true);

      /* Lock the settings again after saving */
      setIsEditingSettings(false);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);

      setSettingsError(
        error instanceof Error
          ? error.message
          : "Failed to save settings."
      );
    } finally {
      setSavingSettings(false);
    }
  };

  /* -----------------------------
     Change Password
  ----------------------------- */

  const handlePasswordChange = async () => {
    try {
      setChangingPassword(true);
      setPasswordError("");
      setPasswordSuccess("");

      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError(
          "Please fill in all password fields."
        );
        return;
      }

      if (newPassword.length < 8) {
        setPasswordError(
          "New password must be at least 8 characters."
        );
        return;
      }

      if (!/[A-Z]/.test(newPassword)) {
        setPasswordError(
          "New password must contain at least one uppercase letter."
        );
        return;
      }

      if (!/[^A-Za-z0-9]/.test(newPassword)) {
        setPasswordError(
          "New password must contain at least one special character."
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError(
          "New password and confirmation password do not match."
        );
        return;
      }

      const response = await fetch(
        "/api/admin/settings/password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to change password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setPasswordSuccess(
        "Password changed successfully."
      );
    } catch (error) {
      console.error("Failed to change password:", error);

      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const cropScale = cropSize / REF_SIZE;

 const viewFieldClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300 outline-none transition-all duration-200 disabled:cursor-default";

const editFieldClass =
  "w-full rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-white/60 focus:bg-zinc-800 focus:ring-2 focus:ring-white/5";

  const passwordFieldClass =
    "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600";

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
            Manage your studio, admin account and branding
            preferences.
          </p>
        </div>

       {!isEditingSettings ? (
  <button
    type="button"
    onClick={handleChangeSettings}
    disabled={loadingSettings}
    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:bg-zinc-100 hover:shadow-2xl hover:shadow-white/20 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <LockKeyhole
      size={18}
      className="transition-transform duration-200 group-hover:scale-110"
    />
    Edit Settings
  </button>
) : (
         <button
  type="button"
  onClick={handleSave}
  disabled={loadingSettings || savingSettings}
  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:bg-zinc-100 hover:shadow-2xl hover:shadow-white/20 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
>
  {saved ? (
    <Check
      size={18}
      className="transition-transform duration-200 group-hover:scale-110"
    />
  ) : (
    <Save
      size={18}
      className="transition-transform duration-200 group-hover:scale-110"
    />
  )}

  {savingSettings
    ? "Saving..."
    : saved
      ? "Saved"
      : "Save Changes"}
</button>
        )}
      </div>

      {/* --------------------------------
          Settings error
      -------------------------------- */}

      {settingsError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {settingsError}
        </div>
      )}

      {/* --------------------------------
          Loading message
      -------------------------------- */}

      {loadingSettings && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
          Loading studio settings...
        </div>
      )}

      {/* --------------------------------
          1. Studio Information
      -------------------------------- */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Studio Information
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {isEditingSettings
              ? "You can now edit your studio information."
              : "Studio information is locked. Click Edit Settings to edit."}
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
              disabled={!isEditingSettings}
              onChange={(e) => {
                setStudioName(e.target.value);
                setSaved(false);
              }}
              onKeyDown={handleSettingsKeyDown}
              className={isEditingSettings ? editFieldClass : viewFieldClass}
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
                Studio Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                disabled={!isEditingSettings}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                onKeyDown={handleSettingsKeyDown}
                className={isEditingSettings ? editFieldClass : viewFieldClass}
                placeholder="studio@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Phone size={15} />
                Studio Phone
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                disabled={!isEditingSettings}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setSaved(false);
                }}
                onKeyDown={handleSettingsKeyDown}
                className={isEditingSettings ? editFieldClass : viewFieldClass}
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
              disabled={!isEditingSettings}
              onChange={(e) => {
                setWebsite(e.target.value);
                setSaved(false);
              }}
              onKeyDown={handleSettingsKeyDown}
              className={isEditingSettings ? editFieldClass : viewFieldClass}
              placeholder="https://yourstudio.com"
            />
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
              disabled={!isEditingSettings}
              onChange={(e) => {
                setAddress(e.target.value);
                setSaved(false);
              }}
              className={`${isEditingSettings ? editFieldClass : viewFieldClass} resize-none`}
              placeholder="Enter your studio address"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                City
              </label>

              <input
                id="city"
                type="text"
                value={city}
                disabled={!isEditingSettings}
                onChange={(e) => {
                  setCity(e.target.value);
                  setSaved(false);
                }}
                onKeyDown={handleSettingsKeyDown}
                className={isEditingSettings ? editFieldClass : viewFieldClass}
                placeholder="Enter city"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                State
              </label>

              <input
                id="state"
                type="text"
                value={state}
                disabled={!isEditingSettings}
                onChange={(e) => {
                  setState(e.target.value);
                  setSaved(false);
                }}
                onKeyDown={handleSettingsKeyDown}
                className={isEditingSettings ? editFieldClass : viewFieldClass}
                placeholder="Enter state"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Country
            </label>

            <input
              id="country"
              type="text"
              value={country}
              disabled={!isEditingSettings}
              onChange={(e) => {
                setCountry(e.target.value);
                setSaved(false);
              }}
              onKeyDown={handleSettingsKeyDown}
              className={isEditingSettings ? editFieldClass : viewFieldClass}
              placeholder="Enter country"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              About the Studio
            </label>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">
              {description ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                  {description}
                </p>
              ) : (
                <p className="text-sm text-zinc-600">
                  No studio description has been provided by the platform administrator yet.
                </p>
              )}
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              This information is managed by the platform administrator and can only be updated by them.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------
          2. Admin Information
      -------------------------------- */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Admin Information
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {isEditingSettings
              ? "You can now edit the contact information associated with this admin account."
              : "Admin information is locked. Click Edit Settings to edit."}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="adminName"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Admin Name
            </label>

            <input
              id="adminName"
              type="text"
              value={adminName}
              disabled={!isEditingSettings}
              onChange={(e) => {
                setAdminName(e.target.value);
                setSaved(false);
              }}
              onKeyDown={handleSettingsKeyDown}
              className={isEditingSettings ? editFieldClass : viewFieldClass}
              placeholder="Enter admin name"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="adminEmail"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Mail size={15} />
                Admin Email
              </label>

              <input
                id="adminEmail"
                type="email"
                value={adminEmail}
                disabled={!isEditingSettings}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  setSaved(false);
                }}
                onKeyDown={handleSettingsKeyDown}
                className={isEditingSettings ? editFieldClass : viewFieldClass}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="adminPhone"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Phone size={15} />
                Admin Phone
              </label>

              <input
                id="adminPhone"
                type="tel"
                value={adminPhone}
                disabled={!isEditingSettings}
                onChange={(e) => {
                  setAdminPhone(e.target.value);
                  setSaved(false);
                }}
                onKeyDown={handleSettingsKeyDown}
                className={isEditingSettings ? editFieldClass : viewFieldClass}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------
          3. Change Password
      -------------------------------- */}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-zinc-800 p-2.5">
              <KeyRound
                size={18}
                className="text-zinc-300"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Change the password used to sign in to this
                admin account.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300"
            >
              <LockKeyhole size={15} />
              Current Password
            </label>

            <div className="relative">
              <input
                id="currentPassword"
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                className={passwordFieldClass}
                placeholder="Enter current password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    (value) => !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showCurrentPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  className={passwordFieldClass}
                  placeholder="Minimum 8 characters"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Minimum 8 characters, 1 uppercase letter and
                1 special character.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  className={passwordFieldClass}
                  placeholder="Re-enter new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {passwordSuccess}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <KeyRound size={17} />

              {changingPassword
                ? "Changing..."
                : "Change Password"}
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------
          4. Branding
      -------------------------------- */}

      <section
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6"
        id="branding"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Branding
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Customize the appearance of your client galleries.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] 2xl:grid-cols-[320px_1fr]">
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
                        isDragging
                          ? "cursor-grabbing"
                          : "cursor-grab"
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

                {isEditingLogo && (
                  <div
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${
                      isDragging
                        ? "opacity-100"
                        : "opacity-0"
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
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

            {isEditingLogo && (
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-zinc-950/70 p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-white">
                    Position New Logo
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Drag the image to move it. Scroll or pinch
                    to zoom. Your current logo stays active until
                    you click Apply Logo.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={cancelLogoEditing}
                    disabled={savingLogo}
                    className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={applyLogo}
                    disabled={savingLogo}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={14} />
                    {savingLogo
                      ? "Applying..."
                      : "Apply Logo"}
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
        </div>
      </section>

      {/* --------------------------------
          Bottom Save
      -------------------------------- */}

      {isEditingSettings && (
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
            disabled={loadingSettings || savingSettings}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-lg shadow-white/10 transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:bg-zinc-100 hover:shadow-2xl hover:shadow-white/20 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saved ? (
  <Check
    size={18}
    className="transition-transform duration-200 group-hover:scale-110"
  />
) : (
  <Save
    size={18}
    className="transition-transform duration-200 group-hover:scale-110"
  />
)}

            {savingSettings
              ? "Saving..."
              : saved
                ? "Saved"
                : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}