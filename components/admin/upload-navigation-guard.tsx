
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface UploadNavigationContextType {
  isUploading: boolean;
  setUploadActive: (active: boolean) => void;
  registerCancelHandler: (
    handler: (() => Promise<void>) | null
  ) => void;
  requestNavigation: (action: () => void) => boolean;
}

const UploadNavigationContext =
  createContext<UploadNavigationContextType | null>(null);

export function useUploadNavigationGuard() {
  const context = useContext(UploadNavigationContext);

  if (!context) {
    throw new Error(
      "useUploadNavigationGuard must be used inside UploadNavigationGuard"
    );
  }

  return context;
}

export default function UploadNavigationGuard({
  children,
}: {
  children: ReactNode;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const cancelHandlerRef = useRef<
    (() => Promise<void>) | null
  >(null);

  const setUploadActive = useCallback((active: boolean) => {
    setIsUploading(active);
  }, []);

  const registerCancelHandler = useCallback(
    (handler: (() => Promise<void>) | null) => {
      cancelHandlerRef.current = handler;
    },
    []
  );

  const requestNavigation = useCallback(
    (action: () => void) => {
      if (!isUploading) return false;

      pendingNavigationRef.current = action;
      setShowModal(true);

      return true;
    },
    [isUploading]
  );

  const stayOnPage = () => {
    pendingNavigationRef.current = null;
    setShowModal(false);
  };

  const leavePage = async () => {
    if (isLeaving) return;

    setIsLeaving(true);

    try {
      await cancelHandlerRef.current?.();

      const action = pendingNavigationRef.current;

      pendingNavigationRef.current = null;
      setShowModal(false);

      action?.();
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <UploadNavigationContext.Provider
      value={{
        isUploading,
        setUploadActive,
        registerCancelHandler,
        requestNavigation,
      }}
    >
      {children}

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="upload-navigation-title"
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
          >
            <h2
              id="upload-navigation-title"
              className="text-lg font-semibold text-white"
            >
              Upload in progress
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Your photos are still uploading. If you leave
              this page, the current upload process will stop.
              Already completed uploads will remain saved.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={stayOnPage}
                disabled={isLeaving}
                className="rounded-xl border border-zinc-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={leavePage}
                disabled={isLeaving}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-60"
              >
                {isLeaving ? "Stopping upload..." : "Leave Page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UploadNavigationContext.Provider>
  );
}
