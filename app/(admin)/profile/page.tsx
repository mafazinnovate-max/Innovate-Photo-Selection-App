"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import PicknovateLoader from "@/components/admin/picknovate-loader";
import PremiumTemplate from "@/app/studio/templates/premium-template";

type PackageItem = {
  id: string;
  name: string;
  price: string;
  description: string;
};

type PortfolioPhoto = {
  id?: string;
  file?: File;
  preview: string;
  imageUrl?: string;
  publicId?: string;
};

type ProfileData = {
  studioName: string;
  logoUrl: string;
  description: string;
  shortTagline: string;
  coverPhotoUrl: string;
  ownerName: string;
  ownerPhone: string;
  phoneNumber: string;
  email: string;
  address: string;
  location: string;
  instagramUrl: string;
  websiteUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  otherLinks: string;
  additionalInfo: string;
};

type FieldErrors = Partial<
  Record<keyof ProfileData, string>
>;

const profileTemplates = [
  {
    key: "template-1",
    name: "Template 1",
    description: "Black theme with yellow accents",
  },
  {
    key: "template-2",
    name: "Template 2",
    description: "Warm brown and beige theme",
  },
  {
    key: "template-3",
    name: "Template 3",
    description: "Your third custom design",
  },
] as const;

// Premium website development enquiry (Innovate Wedding Company).
const PREMIUM_PREVIEW_URL = "/profile/preview/premium";

const WHATSAPP_NUMBER_DISPLAY = "+91 84384 30504";

const WHATSAPP_MESSAGE =
  "Hello Innovate Wedding Company! I'm interested in getting a professionally designed website for my photography studio. Could you please share more details about your website development options?";

const WHATSAPP_URL = `https://wa.me/918438430504?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

const premiumHighlights = [
  "Designed around your studio and brand",
  "Built and delivered by our development team",
  "Looks polished on mobile, tablet and desktop",
  "Preview the design before you get in touch",
];

const emptyProfile: ProfileData = {
  studioName: "",
  logoUrl: "",
  description: "",
  shortTagline: "",
  coverPhotoUrl: "",
  ownerName: "",
  ownerPhone: "",
  phoneNumber: "",
  email: "",
  address: "",
  location: "",
  instagramUrl: "",
  websiteUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  otherLinks: "",
  additionalInfo: "",
};

const requiredFields: {
  field: keyof ProfileData;
  label: string;
}[] = [
  {
    field: "studioName",
    label: "Studio Name",
  },
  {
    field: "shortTagline",
    label: "Short Tagline",
  },
  {
    field: "description",
    label: "Studio Description",
  },
  {
    field: "logoUrl",
    label: "Studio Logo",
  },
  {
    field: "coverPhotoUrl",
    label: "Studio Cover Photo",
  },
  {
    field: "ownerName",
    label: "Owner Name",
  },
  {
    field: "ownerPhone",
    label: "Owner Phone Number",
  },
  {
    field: "phoneNumber",
    label: "Phone Number",
  },
  {
    field: "email",
    label: "Email ID",
  },
  {
    field: "address",
    label: "Address",
  },
  {
    field: "location",
    label: "Location",
  },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<ProfileData>(emptyProfile);

    const [selectedTemplate, setSelectedTemplate] =
    useState("template-1");

    const [savingTemplate, setSavingTemplate] = useState(false);

    const [showPremiumPreview, setShowPremiumPreview] = useState(false);

    // Local UI state only: the Premium option is never saved to the
    // database and never sent to any API.
    const [premiumSelected, setPremiumSelected] = useState(false);

    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const premiumModalRef = useRef<HTMLDivElement>(null);
    const [copiedProfileUrl, setCopiedProfileUrl] = useState(false);

    const [publishing, setPublishing] = useState(false);

    const [isPublished, setIsPublished] = useState(false);
    const [publicSlug, setPublicSlug] = useState("");

    const [fieldErrors, setFieldErrors] =
      useState<FieldErrors>({});

    async function handleTemplateSelect(templateKey: string) {
  if (savingTemplate || templateKey === selectedTemplate) return;

setSelectedTemplate(templateKey);
setSavingTemplate(true);
setError("");
setMessage("");

  try {
    const response = await fetch("/api/profile/template", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ templateKey }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Failed to update template."
      );
    }

    setSelectedTemplate(data.profile.templateKey);
    setMessage("Website template updated successfully.");
  } catch (err) {
    console.error("Template selection error:", err);

      // Restore the previously saved template if the API request fails.
      setSelectedTemplate(selectedTemplate);


    setError(
      err instanceof Error
        ? err.message
        : "Failed to update template."
    );
  } finally {
    setSavingTemplate(false);
  }
}

    // Choosing any free template leaves Premium mode, then runs the
    // existing free-template selection exactly as before.
    function handleFreeTemplateClick(templateKey: string) {
  if (premiumSelected) {
    setPremiumSelected(false);
  }

  void handleTemplateSelect(templateKey);
}

    function handlePremiumSelect() {
  setPremiumSelected(true);

  window.open(
    PREMIUM_PREVIEW_URL,
    "_blank",
    "noopener,noreferrer"
  );
}
    
const handlePublishToggle = async () => {
  // Premium is a separate purchase: never publish the Premium
  // template. Unpublishing is still allowed and uses the API below.
  if (!isPublished && premiumSelected) {
    setMessage("");
    setError("");
    setShowPremiumModal(true);
    return;
  }

  // Validate only when publishing, not when unpublishing.
  if (!isPublished) {
    setMessage("");
    setError("");

    if (
      uploadingLogo ||
      uploadingCover ||
      uploadingPortfolio
    ) {
      setError(
        "Please wait until all uploads are completed before publishing your website."
      );
      return;
    }

    if (!validateRequiredFields()) {
      return;
    }
  }

  try {
    setPublishing(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/profile/publish", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isPublished: !isPublished,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Failed to update publishing status."
      );
    }

    setIsPublished(data.profile.isPublished);
    setPublicSlug(data.profile.publicSlug ?? "");

    if (
  data.profile.isPublished &&
  data.profile.publicSlug
) {
  window.location.assign(
    `/studio/${data.profile.publicSlug}`
  );
  return;
}

    setMessage(
      data.profile.isPublished
        ? "Your studio website is now published."
        : "Your studio website has been unpublished."
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to update publishing status."
    );
  } finally {
    setPublishing(false);
  }
};

async function handleCopyProfileUrl() {
  if (!publicSlug) return;

  const profileUrl = `${window.location.origin}/studio/${publicSlug}`;

  try {
    await navigator.clipboard.writeText(profileUrl);
    setCopiedProfileUrl(true);
  } catch (error) {
    console.error("Failed to copy profile URL:", error);
    setCopiedProfileUrl(false);
  }
}

  const [packages, setPackages] = useState<PackageItem[]>(
    []
  );

  const [portfolioPhotos, setPortfolioPhotos] = useState<
    PortfolioPhoto[]
  >([]);

  const [previewPhoto, setPreviewPhoto] =
    useState<PortfolioPhoto | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [uploadingCover, setUploadingCover] =
    useState(false);

  const [uploadingPortfolio, setUploadingPortfolio] =
    useState(false);

    const [portfolioUploadProgress, setPortfolioUploadProgress] =
  useState(0);

const [portfolioUploadTotal, setPortfolioUploadTotal] =
  useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showSuccessToast, setShowSuccessToast] =
    useState(false);

  const [showSavedState, setShowSavedState] =
    useState(false);

  const studioNameRef =
    useRef<HTMLInputElement>(null);

  const shortTaglineRef =
    useRef<HTMLInputElement>(null);

  const descriptionRef =
    useRef<HTMLTextAreaElement>(null);

  const logoRef =
    useRef<HTMLInputElement>(null);

  const coverRef =
    useRef<HTMLInputElement>(null);

  // Wrapper refs used only as scroll targets for the logo and
  // cover sections (their file inputs are hidden, so they cannot
  // be scrolled to directly).
  const logoSectionRef =
    useRef<HTMLDivElement>(null);

  const coverSectionRef =
    useRef<HTMLDivElement>(null);

  const ownerNameRef =
    useRef<HTMLInputElement>(null);

  const ownerPhoneRef =
    useRef<HTMLInputElement>(null);

  const phoneNumberRef =
    useRef<HTMLInputElement>(null);

  const emailRef =
    useRef<HTMLInputElement>(null);

  const addressRef =
    useRef<HTMLTextAreaElement>(null);

  const locationRef =
    useRef<HTMLInputElement>(null);

  const topRef = useRef<HTMLDivElement>(null);

  const successToastTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedStateTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (successToastTimerRef.current) {
        clearTimeout(successToastTimerRef.current);
      }

      if (savedStateTimerRef.current) {
        clearTimeout(savedStateTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
  if (!message && !error) {
    return;
  }

  const timer = window.setTimeout(() => {
    setMessage("");
    setError("");
    setShowSuccessToast(false);
  }, 4000);

  return () => {
    window.clearTimeout(timer);
  };
}, [message, error]);

  // Premium modal: focus the dialog, close on Escape, keep Tab inside
  // the dialog, lock page scroll, and restore focus on close.
  useEffect(() => {
    if (!showPremiumModal) {
      return;
    }

    const previouslyFocused =
      document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    premiumModalRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowPremiumModal(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = premiumModalRef.current;

      if (!dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [showPremiumModal]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/profile", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();

      if (!data.profile) {
        return;
      }

      const savedProfile = data.profile;

      setSelectedTemplate(
  savedProfile.templateKey ?? "template-1"
);

    setIsPublished(savedProfile.isPublished ?? false);
setPublicSlug(savedProfile.publicSlug ?? "");

      setProfile({
        studioName: savedProfile.studioName ?? "",
        logoUrl: savedProfile.logoUrl ?? "",
        description: savedProfile.description ?? "",
        shortTagline: savedProfile.shortTagline ?? "",
        coverPhotoUrl: savedProfile.coverPhotoUrl ?? "",
        ownerName: savedProfile.ownerName ?? "",
        ownerPhone: savedProfile.ownerPhone ?? "",
        phoneNumber: savedProfile.phoneNumber ?? "",
        email: savedProfile.email ?? "",
        address: savedProfile.address ?? "",
        location: savedProfile.location ?? "",
        instagramUrl: savedProfile.instagramUrl ?? "",
        websiteUrl: savedProfile.websiteUrl ?? "",
        facebookUrl: savedProfile.facebookUrl ?? "",
        youtubeUrl: savedProfile.youtubeUrl ?? "",
        otherLinks: savedProfile.otherLinks ?? "",
        additionalInfo: savedProfile.additionalInfo ?? "",
      });

      setPackages(
        (savedProfile.packages ?? []).map(
          (item: PackageItem) => ({
            id: item.id,
            name: item.name,
            price: item.price ?? "",
            description: item.description,
          })
        )
      );

      setPortfolioPhotos(
        (savedProfile.portfolioPhotos ?? []).map(
          (photo: PortfolioPhoto) => ({
            id: photo.id,
            preview: photo.imageUrl ?? "",
            imageUrl: photo.imageUrl,
            publicId: photo.publicId,
          })
        )
      );
    } catch (loadError) {
      console.error("Profile load error:", loadError);
      setError("Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  const updateField = useCallback(
    (
      field: keyof ProfileData,
      value: string
    ) => {
      setProfile((current) => ({
        ...current,
        [field]: value,
      }));

      // Clear only this field's inline error once it has a value.
      if (value.trim()) {
        setFieldErrors((current) => {
          if (!current[field]) {
            return current;
          }

          const next = { ...current };
          delete next[field];
          return next;
        });
      }
    },
    []
  );

 
async function uploadMedia(
  file: File,
  type: "logo" | "cover" | "portfolio",
  currentCount?: number
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("type", type);

  if (type === "portfolio") {
    formData.append(
      "currentCount",
      String(currentCount ?? 0)
    );
  }

  const response = await fetch("/api/profile/media", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || data.error || "Image upload failed"
    );
  }

  return {
    url: data.url as string,
    publicId: data.publicId as string,
  };
}


  async function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setUploadingLogo(true);
      setError("");
      setMessage("");

      const result = await uploadMedia(file, "logo");

      updateField("logoUrl", result.url);
      setMessage("Logo uploaded.");
    } catch (uploadError) {
      console.error("Logo upload error:", uploadError);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Logo upload failed."
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleCoverChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setUploadingCover(true);
      setError("");
      setMessage("");

      const result = await uploadMedia(file, "cover");

      updateField("coverPhotoUrl", result.url);
      setMessage("Cover photo uploaded.");
    } catch (uploadError) {
      console.error("Cover upload error:", uploadError);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Cover photo upload failed."
      );
    } finally {
      setUploadingCover(false);
    }
  }

 
async function handlePortfolioChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const files = Array.from(event.target.files ?? []);

  event.target.value = "";

  if (files.length === 0) {
    return;
  }

  const availableSlots = Math.max(
    0,
    25 - portfolioPhotos.length
  );

  if (availableSlots === 0) {
    setError("Portfolio limit reached. Maximum 25 photos are allowed.");
    return;
  }

  const filesToUpload = files.slice(0, availableSlots);
  const skippedCount = files.length - filesToUpload.length;

  try {
    setUploadingPortfolio(true);
    setError("");
    setMessage("");

    setPortfolioUploadProgress(0);
    setPortfolioUploadTotal(filesToUpload.length);

    const uploadedPhotos: PortfolioPhoto[] = [];

    for (let index = 0; index < filesToUpload.length; index++) {
      const file = filesToUpload[index];

      const currentCount =
        portfolioPhotos.length + uploadedPhotos.length;

      const result = await uploadMedia(
        file,
        "portfolio",
        currentCount
      );

      const uploadedPhoto: PortfolioPhoto = {
        file,
        preview: result.url,
        imageUrl: result.url,
        publicId: result.publicId,
      };

      uploadedPhotos.push(uploadedPhoto);

      setPortfolioPhotos((current) => [
        ...current,
        uploadedPhoto,
      ]);

      setPortfolioUploadProgress(index + 1);
    }

    if (skippedCount > 0) {
      setMessage(
        `${uploadedPhotos.length} photo uploaded. ${skippedCount} photo skipped because the maximum limit is 25.`
      );
    } else {
      setMessage(
        `${uploadedPhotos.length} ${
          uploadedPhotos.length === 1 ? "photo" : "photos"
        } uploaded successfully.`
      );
    }
  } catch (uploadError) {
    console.error("Portfolio upload error:", uploadError);

    setError(
      uploadError instanceof Error
        ? uploadError.message
        : "Portfolio upload failed."
    );
  } finally {
    setUploadingPortfolio(false);
    setPortfolioUploadProgress(0);
    setPortfolioUploadTotal(0);
  }
}

  async function removePortfolioPhoto(
  photo: PortfolioPhoto
) {
  try {
    setError("");
    setMessage("");

    if (photo.publicId) {
      const response = await fetch(
        "/api/profile/media",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: photo.publicId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.error ||
            "Failed to remove portfolio photo"
        );
      }
    }

    if (photo.preview.startsWith("blob:")) {
      URL.revokeObjectURL(photo.preview);
    }

    setPortfolioPhotos((current) =>
      current.filter((item) => {
        if (photo.id) {
          return item.id !== photo.id;
        }

        if (photo.publicId) {
          return item.publicId !== photo.publicId;
        }

        return item.preview !== photo.preview;
      })
    );

    if (
      previewPhoto?.id === photo.id ||
      previewPhoto?.preview === photo.preview
    ) {
      setPreviewPhoto(null);
    }
  } catch (removeError) {
    console.error(
      "Portfolio remove error:",
      removeError
    );

    setError(
      removeError instanceof Error
        ? removeError.message
        : "Failed to remove portfolio photo."
    );
  }
}

  async function clearPortfolio() {
    try {
      setError("");
      setMessage("");

      for (const photo of portfolioPhotos) {
        if (photo.publicId) {
          await fetch("/api/profile/media", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publicId: photo.publicId,
            }),
          });
        }

        if (photo.preview.startsWith("blob:")) {
          URL.revokeObjectURL(photo.preview);
        }
      }

      setPortfolioPhotos([]);
      setPreviewPhoto(null);
    } catch (clearError) {
      console.error(
        "Portfolio clear error:",
        clearError
      );

      setError("Failed to clear portfolio photos.");
    }
  }

    function scrollToElement(
    element:
      | HTMLElement
      | null
      | undefined
  ) {
    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "auto",
      block: "center",
    });

    element.focus({ preventScroll: true });
  }

  function validateRequiredFields() {
    const fieldRefs: Partial<
      Record<
        keyof ProfileData,
        HTMLElement | null
      >
    > = {
      studioName: studioNameRef.current,
      shortTagline: shortTaglineRef.current,
      description: descriptionRef.current,
      logoUrl: logoSectionRef.current,
      coverPhotoUrl: coverSectionRef.current,
      ownerName: ownerNameRef.current,
      ownerPhone: ownerPhoneRef.current,
      phoneNumber: phoneNumberRef.current,
      email: emailRef.current,
      address: addressRef.current,
      location: locationRef.current,
    };

    const newFieldErrors: FieldErrors = {};

    let firstMissing:
      | (typeof requiredFields)[number]
      | null = null;

    for (const requiredField of requiredFields) {
      const value = profile[requiredField.field];

      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        newFieldErrors[requiredField.field] =
          `${requiredField.label} is required.`;

        if (!firstMissing) {
          firstMissing = requiredField;
        }
      }
    }

    setFieldErrors(newFieldErrors);

    if (firstMissing) {
      setError(
        `${firstMissing.label} is required.`
      );
      setMessage("");

      const target =
        fieldRefs[firstMissing.field];

      scrollToElement(target);

      return false;
    }

    return true;
  }

  function showSuccessFeedback() {
    setMessage("Profile saved successfully.");
    setError("");
    setShowSavedState(true);
    setShowSuccessToast(true);

    if (successToastTimerRef.current) {
      clearTimeout(successToastTimerRef.current);
    }

    if (savedStateTimerRef.current) {
      clearTimeout(savedStateTimerRef.current);
    }

    successToastTimerRef.current =
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);

    savedStateTimerRef.current =
      setTimeout(() => {
        setShowSavedState(false);
      }, 2200);
  }

  async function saveProfile() {
    if (saving) {
      return;
    }

    setError("");
    setMessage("");
    setShowSuccessToast(false);

    if (!validateRequiredFields()) {
      return;
    }

    if (
      uploadingLogo ||
      uploadingCover ||
      uploadingPortfolio
    ) {
      setError(
        "Please wait until all uploads are completed before saving."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          packages: packages.map((item) => ({
            name: item.name,
            price: item.price,
            description: item.description,
          })),
          portfolioPhotos: portfolioPhotos.map(
            (photo) => ({
              id: photo.id,
              imageUrl: photo.imageUrl,
              publicId: photo.publicId,
            })
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to save profile"
        );
      }

      if (data.profile) {
        setProfile((current) => ({
          ...current,
          studioName:
            data.profile.studioName ??
            current.studioName,
          logoUrl:
            data.profile.logoUrl ??
            current.logoUrl,
          description:
            data.profile.description ??
            "",
          shortTagline:
            data.profile.shortTagline ??
            "",
          coverPhotoUrl:
            data.profile.coverPhotoUrl ??
            current.coverPhotoUrl,
          ownerName:
            data.profile.ownerName ?? "",
          ownerPhone:
            data.profile.ownerPhone ?? "",
          phoneNumber:
            data.profile.phoneNumber ?? "",
          email: data.profile.email ?? "",
          address:
            data.profile.address ?? "",
          location:
            data.profile.location ?? "",
          instagramUrl:
            data.profile.instagramUrl ?? "",
          websiteUrl:
            data.profile.websiteUrl ?? "",
          facebookUrl:
            data.profile.facebookUrl ?? "",
          youtubeUrl:
            data.profile.youtubeUrl ?? "",
          otherLinks:
            data.profile.otherLinks ?? "",
          additionalInfo:
            data.profile.additionalInfo ?? "",
        }));

        setPackages(
          data.profile.packages ?? []
        );

        setPortfolioPhotos(
          (data.profile.portfolioPhotos ?? []).map(
            (photo: PortfolioPhoto) => ({
              id: photo.id,
              preview: photo.imageUrl ?? "",
              imageUrl: photo.imageUrl,
              publicId: photo.publicId,
            })
          )
        );
      }

      showSuccessFeedback();

      requestAnimationFrame(() => {
  topRef.current?.scrollIntoView({
    behavior: "auto",
    block: "start",
  });
});
    } catch (saveError) {
      console.error(
        "Profile save error:",
        saveError
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save profile."
      );

     requestAnimationFrame(() => {
  topRef.current?.scrollIntoView({
    behavior: "auto",
    block: "start",
  });
});
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    void saveProfile();
  }


if (loading) {
  return (
    <main className="min-h-screen bg-black">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center lg:min-h-screen">
        <PicknovateLoader />
      </div>
    </main>
  );
}


  const saveDisabled =
    saving ||
    uploadingLogo ||
    uploadingCover ||
    uploadingPortfolio;

  return (
    <main
      ref={topRef}
      className="min-h-screen bg-black px-4 py-7 text-white sm:px-6 lg:px-8 lg:py-8"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl"
      >
        <div className="flex flex-col gap-5 border-b border-zinc-800 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Studio Profile
            </h1>

            <p className="mt-1.5 text-sm text-zinc-400">
              Create and manage your studio profile for
              your public website.
            </p>
          </div>

          <button
            type="submit"
            disabled={saveDisabled}
            className="group relative inline-flex min-w-[145px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-[0_10px_30px_rgba(255,255,255,0.08)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                <span>Saving...</span>
              </>
            ) : showSavedState ? (
              <>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white animate-[success-pop_0.35s_ease-out]">
                  ✓
                </span>
                <span>Saved</span>
              </>
            ) : (
              <>
                <span>Save Profile</span>
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </>
            )}
          </button>
        </div>

        {message && !showSuccessToast && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Website Template Selection (free templates) */}
<section className="rounded-2xl border border-white/10 bg-[#111] p-6">
  <div className="mb-5">
    <h2 className="text-lg font-semibold text-white">
      Website Template
    </h2>
    <p className="mt-1 text-sm text-gray-400">
      Choose the design for your public studio profile.
    </p>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {profileTemplates.map((template) => {
      const isSelected =
        selectedTemplate === template.key && !premiumSelected;

      return (
        <button
          key={template.key}
          type="button"
          onClick={() => handleFreeTemplateClick(template.key)}
          disabled={savingTemplate}
          className={`rounded-xl border p-4 text-left transition ${
            isSelected
              ? "border-yellow-500 bg-yellow-500/10"
              : "border-white/10 bg-white/[0.02] hover:border-white/30"
          }`}
        >
          <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-[#202020]">
            <span className="text-sm text-gray-400">
              {template.name} Preview
            </span>
          </div>

          <p className="font-medium text-white">{template.name}</p>
          <p className="mt-1 text-xs text-gray-400">
            {template.description}
          </p>

          {isSelected && (
            <p className="mt-3 text-xs font-semibold text-yellow-500">
              SELECTED
            </p>
          )}
        </button>
      );
    })}
  </div>
</section>

 
<div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-4 sm:p-6">
  {isPublished && publicSlug ? (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">
          Publish Studio Website
        </h2>

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500">
          Published
        </span>
      </div>

      {/* Published Status */}
      <div className="mt-5 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
          <circle cx="12" cy="12" r="10" />
        </svg>

        <p className="text-base font-medium text-green-500">
          Your website is live!
        </p>
      </div>

      {/* Public URL */}
      <div className="mt-5">
        <p className="text-sm text-zinc-300">
          Your public website link
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <a
            href={`/studio/${publicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-base font-semibold text-orange-500 hover:text-orange-400"
          >
            {`/studio/${publicSlug}`}
          </a>

          <span className="shrink-0 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500">
            Live
          </span>
        </div>
      </div>

      {/* Preview Website */}
      <a
        href={`/studio/${publicSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-500"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 5h5v5m-9 4L19 5M19 13v5a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h5"
          />
        </svg>

        Preview Your Website
      </a>

      <p className="mt-4 text-center text-sm text-zinc-300">
        Opens your published website in a new tab.
      </p>

      {/* Copy Profile URL */}
      <button
        type="button"
        onClick={handleCopyProfileUrl}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-green-500/50 hover:bg-zinc-800"
      >
        {copiedProfileUrl ? (
          <>
            <svg
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Profile URL Copied!
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
              />
            </svg>
            Copy Profile URL
          </>
        )}
      </button>

      <p className="mt-2 text-center text-xs text-zinc-500">
        Share your studio website link with your clients and customers.
      </p>

      {/* Divider */}
      <div className="my-6 border-t border-zinc-800" />

      {/* Unpublish */}
      <button
        type="button"
        onClick={handlePublishToggle}
        disabled={publishing}
        className="w-full py-1 text-center text-base font-semibold text-red-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {publishing ? "Please wait..." : "Unpublish Website"}
      </button>
    </>
  ) : (
    <>
      {/* Unpublished State */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Publish Studio Website
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Make your studio website publicly accessible through a shareable link.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />

            <span className="text-sm text-zinc-300">
              Website Not Published
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePublishToggle}
          disabled={publishing}
          className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing ? "Please wait..." : "Publish Website"}
        </button>
      </div>
    </>
  )}
</div>


        {/* Premium Website (separate paid service) */}
<section
  aria-labelledby="premium-website-heading"
  className="relative mt-6 overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-gradient-to-br from-[#17130a] via-[#0a0a0a] to-[#1d1608] p-5 shadow-[0_24px_70px_rgba(212,175,55,0.07)] sm:p-8"
>
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#d4af37]/10 blur-3xl"
  />
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#b8860b]/10 blur-3xl"
  />
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent"
  />

  <div className="relative">
    <div className="max-w-2xl">
      <h2
        id="premium-website-heading"
        className="bg-gradient-to-r from-[#f5deb3] via-[#d4af37] to-[#f5deb3] bg-clip-text text-xl font-semibold tracking-tight text-transparent sm:text-2xl"
      >
        Premium Website
      </h2>

      <p className="mt-1.5 text-sm text-zinc-400">
        A fully custom website for your studio, built by our team.
        Open the preview to see the style.
      </p>
    </div>

    <button
      type="button"
      onClick={handlePremiumSelect}
      aria-pressed={premiumSelected}
      className={`group mt-6 grid w-full gap-6 rounded-2xl border bg-black/40 p-4 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/55 hover:shadow-[0_18px_50px_rgba(212,175,55,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] sm:p-5 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8 ${
        premiumSelected
          ? "border-[#d4af37] ring-1 ring-[#d4af37]/60"
          : "border-[#d4af37]/30 hover:border-[#d4af37]/70"
      }`}
    >
      <span
        aria-hidden="true"
        className="relative block overflow-hidden rounded-xl border border-[#d4af37]/20 bg-gradient-to-br from-[#241c0a] via-[#121212] to-[#0a0a0a] p-3 transition-transform duration-500 group-hover:scale-[1.02]"
      >
        <span className="mb-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#d4af37]/70" />
          <span className="h-2 w-2 rounded-full bg-[#d4af37]/40" />
          <span className="h-2 w-2 rounded-full bg-[#d4af37]/20" />
          <span className="ml-3 h-2 flex-1 rounded-full bg-white/5" />
        </span>

        <span className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#2a2110] via-[#15120a] to-black">
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.22),transparent_55%)]" />
          <span className="relative text-center">
            <span className="block text-[11px] tracking-[0.3em] text-[#d4af37]/80">
              YOUR STUDIO
            </span>
            <span className="mx-auto mt-3 block h-px w-16 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            <span className="mt-3 block text-sm text-zinc-400">
              Premium Website Preview
            </span>
          </span>
        </span>

        <span className="mt-3 grid grid-cols-3 gap-2">
          <span className="block aspect-[4/3] rounded-md bg-white/[0.04]" />
          <span className="block aspect-[4/3] rounded-md bg-white/[0.06]" />
          <span className="block aspect-[4/3] rounded-md bg-white/[0.04]" />
        </span>
      </span>

      <span className="block">
        <span className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#f0d98a] px-3 py-1 text-[10px] font-bold tracking-wider text-black">
            PREMIUM
          </span>

          {premiumSelected && (
            <span className="rounded-full border border-[#d4af37]/60 px-3 py-1 text-[10px] font-semibold tracking-wider text-[#d4af37]">
              SELECTED
            </span>
          )}
        </span>

        <span className="mt-4 block text-lg font-semibold text-white sm:text-xl">
          Custom-built studio website
        </span>

        <span className="mt-2 block text-sm leading-6 text-zinc-400">
          A professionally developed website, separate from the free
          templates above, created for your photography business.
        </span>

        <span className="mt-5 block space-y-2.5">
          {premiumHighlights.map((item) => (
            <span
              key={item}
              className="flex items-start gap-2.5 text-sm text-zinc-300"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/15 text-[10px] text-[#d4af37]">
                ✓
              </span>
              <span>{item}</span>
            </span>
          ))}
        </span>

        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d4af37] transition-colors group-hover:text-[#f0d98a]">
          View preview
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </span>
    </button>
  </div>
</section>

        {/* Website development enquiry */}
<section
  aria-labelledby="website-enquiry-heading"
  className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8"
>
  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="max-w-2xl">
      <h2
        id="website-enquiry-heading"
        className="text-lg font-semibold text-white sm:text-xl"
      >
        Give Your Studio a Professional Online Presence
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Looking to take your photography business online? We create
        professionally designed websites tailored to your studio and
        brand. Get in touch with our team to discuss your website
        requirements.
      </p>

      <p className="mt-3 text-xs text-zinc-500">
        Innovate Wedding Company · {WHATSAPP_NUMBER_DISPLAY}
      </p>
    </div>

    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(37,211,102,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3ee27c] hover:shadow-[0_14px_36px_rgba(37,211,102,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:translate-y-0 active:scale-[0.98]"
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span>Discuss Your Website on WhatsApp</span>
    </a>
  </div>
</section>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Studio Information
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Tell your clients about your studio.
            </p>
          </div>

          <div className="mt-7 space-y-6">
            <div>
              <label
                htmlFor="studioName"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Studio Name{" "}
                <span className="text-red-400">*</span>
              </label>

              <input
                ref={studioNameRef}
                id="studioName"
                type="text"
                value={profile.studioName}
                onChange={(event) =>
                  updateField(
                    "studioName",
                    event.target.value
                  )
                }
                placeholder="Enter studio name"
                required
                autoComplete="organization"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.studioName && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.studioName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="shortTagline"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Short Tagline{" "}
                <span className="text-red-400">*</span>
              </label>

              <input
                ref={shortTaglineRef}
                id="shortTagline"
                type="text"
                value={profile.shortTagline}
                onChange={(event) =>
                  updateField(
                    "shortTagline",
                    event.target.value
                  )
                }
                placeholder="A short line that represents your studio"
                required
                autoComplete="off"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.shortTagline && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.shortTagline}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Studio Description{" "}
                <span className="text-red-400">*</span>
              </label>

              <textarea
                ref={descriptionRef}
                id="description"
                rows={5}
                value={profile.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Tell your clients about your studio..."
                required
                className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.description && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Studio Media
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Add your studio logo and a cover photo for
              your public profile.
            </p>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            <div ref={logoSectionRef}>
              <label className="mb-2.5 block text-sm font-medium text-zinc-300">
                Studio Logo{" "}
                <span className="text-red-400">*</span>
              </label>

              <label
                htmlFor="studioLogo"
                className="group flex min-h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60 px-6 py-8 text-center transition-colors duration-200 hover:border-zinc-500 hover:bg-zinc-900"
              >
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Studio logo"
                    decoding="async"
                    className="h-24 w-24 rounded-full object-contain"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-3xl text-zinc-600 transition-colors group-hover:border-zinc-500 group-hover:text-zinc-400">
                    +
                  </div>
                )}

                <p className="mt-4 text-sm font-medium text-zinc-300">
                  {uploadingLogo
                    ? "Uploading..."
                    : "Upload Studio Logo"}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  PNG, JPG or WEBP · Max 10MB
                </p>

                <input
                  ref={logoRef}
                  id="studioLogo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingLogo}
                  onChange={handleLogoChange}
                />
              </label>

              {fieldErrors.logoUrl && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.logoUrl}
                </p>
              )}
            </div>

            <div ref={coverSectionRef}>
              <label className="mb-2.5 block text-sm font-medium text-zinc-300">
                Studio Cover Photo{" "}
                <span className="text-red-400">*</span>
              </label>

              <label
                htmlFor="coverPhoto"
                className="group relative flex min-h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60 px-6 py-8 text-center transition-colors duration-200 hover:border-zinc-500 hover:bg-zinc-900"
              >
                {profile.coverPhotoUrl ? (
                  <img
                    src={profile.coverPhotoUrl}
                    alt="Studio cover"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                ) : null}

                <div className="relative z-10 flex h-20 w-32 items-center justify-center rounded-xl border border-zinc-700 bg-black/70 text-3xl text-zinc-500 backdrop-blur-sm transition-colors group-hover:border-zinc-500 group-hover:text-zinc-300">
                  {uploadingCover ? "..." : "+"}
                </div>

                <p className="relative z-10 mt-4 text-sm font-medium text-zinc-300">
                  {uploadingCover
                    ? "Uploading..."
                    : "Upload Cover Photo"}
                </p>

                <p className="relative z-10 mt-1 text-xs text-zinc-500">
                  PNG, JPG or WEBP · Max 10MB
                </p>

                <input
                  ref={coverRef}
                  id="coverPhoto"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingCover}
                  onChange={handleCoverChange}
                />
              </label>

              {fieldErrors.coverPhotoUrl && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.coverPhotoUrl}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Studio Owner
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Add the primary owner details for your
              studio profile.
            </p>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ownerName"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Owner Name{" "}
                <span className="text-red-400">*</span>
              </label>

              <input
                ref={ownerNameRef}
                id="ownerName"
                type="text"
                value={profile.ownerName}
                onChange={(event) =>
                  updateField(
                    "ownerName",
                    event.target.value
                  )
                }
                placeholder="Enter owner name"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.ownerName && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.ownerName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="ownerPhone"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Owner Phone Number{" "}
                <span className="text-red-400">*</span>
              </label>

              <input
                ref={ownerPhoneRef}
                id="ownerPhone"
                type="tel"
                value={profile.ownerPhone}
                onChange={(event) =>
                  updateField(
                    "ownerPhone",
                    event.target.value
                  )
                }
                placeholder="Enter owner phone number"
                required
                autoComplete="tel"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.ownerPhone && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.ownerPhone}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Contact Details
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Add the contact information your clients
              can use to reach your studio.
            </p>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Phone Number{" "}
                <span className="text-red-400">*</span>
              </label>

              <input
                ref={phoneNumberRef}
                id="phoneNumber"
                type="tel"
                value={profile.phoneNumber}
                onChange={(event) =>
                  updateField(
                    "phoneNumber",
                    event.target.value
                  )
                }
                placeholder="Enter studio phone number"
                required
                autoComplete="tel"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.phoneNumber && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Email ID{" "}
                <span className="text-red-400">*</span>
              </label>

              <input
                ref={emailRef}
                id="email"
                type="email"
                value={profile.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="Enter studio email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Address{" "}
                <span className="text-red-400">*</span>
              </label>

              <textarea
                ref={addressRef}
                id="address"
                rows={3}
                value={profile.address}
                onChange={(event) =>
                  updateField(
                    "address",
                    event.target.value
                  )
                }
                placeholder="Enter studio address"
                required
                autoComplete="street-address"
                className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.address && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.address}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Location{" "}
                <span className="text-red-400">*</span>
              </label>

              <input
                ref={locationRef}
                id="location"
                type="text"
                value={profile.location}
                onChange={(event) =>
                  updateField(
                    "location",
                    event.target.value
                  )
                }
                placeholder="Enter studio location"
                required
                autoComplete="address-level2"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />

              {fieldErrors.location && (
                <p className="mt-2 text-sm text-red-400">
                  {fieldErrors.location}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Social & Online Presence
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Add the online links you want to showcase
              on your public profile.
            </p>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            {[
              {
                id: "instagramUrl",
                label: "Instagram",
                placeholder:
                  "https://instagram.com/yourstudio",
              },
              {
                id: "websiteUrl",
                label: "Website",
                placeholder:
                  "https://yourstudio.com",
              },
              {
                id: "facebookUrl",
                label: "Facebook",
                placeholder:
                  "https://facebook.com/yourstudio",
              },
              {
                id: "youtubeUrl",
                label: "YouTube",
                placeholder:
                  "https://youtube.com/@yourstudio",
              },
            ].map((item) => (
              <div key={item.id}>
                <label
                  htmlFor={item.id}
                  className="mb-2.5 block text-sm font-medium text-zinc-300"
                >
                  {item.label}
                </label>

                <input
                  id={item.id}
                  type="url"
                  value={
                    profile[
                      item.id as keyof ProfileData
                    ]
                  }
                  onChange={(event) =>
                    updateField(
                      item.id as keyof ProfileData,
                      event.target.value
                    )
                  }
                  placeholder={item.placeholder}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label
                htmlFor="otherLinks"
                className="mb-2.5 block text-sm font-medium text-zinc-300"
              >
                Google Maps Link
              </label>

              <input
                id="otherLinks"
                type="url"
                value={profile.otherLinks}
                onChange={(event) =>
                  updateField(
                    "otherLinks",
                    event.target.value
                  )
                }
                placeholder="Add another useful link"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Additional Information
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Add any other information you want to
              showcase on your public studio profile.
            </p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="additionalInfo"
              className="mb-2.5 block text-sm font-medium text-zinc-300"
            >
              Other Information
            </label>

            <textarea
              id="additionalInfo"
              rows={5}
              value={profile.additionalInfo}
              onChange={(event) =>
                updateField(
                  "additionalInfo",
                  event.target.value
                )
              }
              placeholder="Add any other information about your studio..."
              className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Packages
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Add the photography and studio packages
                you offer.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPackages((current) => [
                  ...current,
                  {
                    id: `new-${Date.now()}-${Math.random()}`,
                    name: "",
                    price: "",
                    description: "",
                  },
                ]);
              }}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            >
              + Add Package
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-5 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No packages added yet.
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Click &quot;Add Package&quot; to create
                your first package.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-300">
                      Package {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setPackages((current) =>
                          current.filter(
                            (item) =>
                              item.id !== pkg.id
                          )
                        );
                      }}
                      className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor={`package-name-${pkg.id}`}
                        className="mb-2.5 block text-sm font-medium text-zinc-300"
                      >
                        Package Name
                      </label>

                      <input
                        id={`package-name-${pkg.id}`}
                        type="text"
                        value={pkg.name}
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setPackages((current) =>
                            current.map((item) =>
                              item.id === pkg.id
                                ? {
                                    ...item,
                                    name: value,
                                  }
                                : item
                            )
                          );
                        }}
                        placeholder="Enter package name"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                      />
                    </div>

                    <div>
  <label
    htmlFor={`package-price-${pkg.id}`}
    className="mb-2.5 block text-sm font-medium text-zinc-300"
  >
    Package Price
  </label>

  <input
    id={`package-price-${pkg.id}`}
    type="text"
    value={pkg.price}
    onChange={(event) => {
      const value = event.target.value;

      setPackages((current) =>
        current.map((item) =>
          item.id === pkg.id
            ? {
                ...item,
                price: value,
              }
            : item
        )
      );
    }}
    placeholder="Enter package price (e.g. ₹25,000)"
    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
  />
</div>

                    <div>
                      <label
                        htmlFor={`package-description-${pkg.id}`}
                        className="mb-2.5 block text-sm font-medium text-zinc-300"
                      >
                        Package Description
                      </label>

                      <textarea
                        id={`package-description-${pkg.id}`}
                        rows={4}
                        value={pkg.description}
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setPackages((current) =>
                            current.map((item) =>
                              item.id === pkg.id
                                ? {
                                    ...item,
                                    description:
                                      value,
                                  }
                                : item
                            )
                          );
                        }}
                        placeholder="Describe what this package includes..."
                        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Portfolio Photos
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Select the photographs you want to
                showcase on your public profile.
              </p>
            </div>

           <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400">
  {portfolioPhotos.length} / 25 photos selected
</div>
          </div>

          <label
  htmlFor="portfolioPhotos"
  className={`group mt-6 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors duration-200 ${
    portfolioPhotos.length >= 25 || uploadingPortfolio
      ? "cursor-not-allowed border-zinc-800 bg-zinc-950 opacity-50"
      : "cursor-pointer border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/70"
  }`}
>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-950 text-2xl text-zinc-500 transition-colors group-hover:border-zinc-500 group-hover:text-zinc-300">
              +
            </div>

           <p
  className={`mt-4 text-sm font-semibold ${
    portfolioPhotos.length >= 25
      ? "text-red-400"
      : "text-zinc-300"
  }`}
>
  {portfolioPhotos.length >= 25
    ? "Portfolio Limit Reached"
    : uploadingPortfolio
      ? "Uploading Photos..."
      : "Add Portfolio Photos"}
</p>

            <p className="mt-1 text-xs text-zinc-600">
              Select multiple photographs from your
              computer
            </p>

            <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-700">
              JPG · PNG · WEBP
            </p>

            <input
              id="portfolioPhotos"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              disabled={uploadingPortfolio || portfolioPhotos.length >= 25}
              className="hidden"
              onChange={handlePortfolioChange}
            />
          </label>


          {uploadingPortfolio && (
            <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-900/80 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">
                  Selected photos are uploading
                </p>

                <p className="text-xs font-medium text-zinc-300">
                  {portfolioUploadProgress} / {portfolioUploadTotal}
                </p>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-700">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{
                    width: `${
                      portfolioUploadTotal > 0
                        ? (portfolioUploadProgress / portfolioUploadTotal) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-zinc-400">
                Please wait while your photos are being uploaded.
              </p>
            </div>
          )}

          {portfolioPhotos.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Selected Photos
                </p>

                <button
                  type="button"
                  onClick={clearPortfolio}
                  className="text-xs font-medium text-zinc-500 transition-colors hover:text-red-400"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {portfolioPhotos.map(
                  (photo, index) => (
                    <div
                      key={
                        photo.id ??
                        photo.preview
                      }
                      className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPhoto(photo)
                        }
                        className="absolute inset-0 z-0"
                        aria-label={`Preview portfolio photo ${
                          index + 1
                        }`}
                      >
                        <img
                          src={photo.preview}
                          alt={`Portfolio photo ${
                            index + 1
                          }`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>

                      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

                      <div className="pointer-events-none absolute left-2 top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-md bg-black/60 px-1.5 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        {index + 1}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removePortfolioPhoto(
                            photo
                          )
                        }
                        className="absolute right-2 top-2 z-20 rounded-md bg-black/70 px-2 py-1.5 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition-all hover:bg-red-500 group-hover:opacity-100"
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {previewPhoto && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
              onClick={() =>
                setPreviewPhoto(null)
              }
            >
              <div
                className="relative flex h-full w-full max-w-7xl items-center justify-center"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <img
                  src={previewPhoto.preview}
                  alt="Portfolio preview"
                  decoding="async"
                  className="max-h-[90vh] max-w-[92vw] object-contain"
                />

                <button
                  type="button"
                  onClick={() =>
                    setPreviewPhoto(null)
                  }
                  className="absolute right-2 top-2 rounded-full border border-zinc-700 bg-black/70 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white hover:text-black hover:shadow-lg sm:right-4 sm:top-4"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="mt-8 flex justify-end border-t border-zinc-800 pt-7">
          <button
            type="submit"
            disabled={saveDisabled}
            className="group relative inline-flex min-w-[155px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-200 hover:shadow-[0_12px_35px_rgba(255,255,255,0.08)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                <span>Saving...</span>
              </>
            ) : showSavedState ? (
              <>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white animate-[success-pop_0.35s_ease-out]">
                  ✓
                </span>
                <span>Saved</span>
              </>
            ) : (
              <>
                <span>Save Profile</span>
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </form>
       

        {saving && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Saving your profile"
        >
          <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/10 bg-[#111] px-8 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
            <div className="mb-6 h-12 w-12 animate-spin rounded-full border-[3px] border-zinc-700 border-t-white" />

            <h2 className="text-lg font-semibold text-white">
              Saving your profile...
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Please wait while we save your changes.
            </p>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-[200] w-[calc(100vw-2rem)] max-w-sm animate-[success-toast-in_0.45s_cubic-bezier(0.16,1,0.3,1)] sm:right-6 sm:top-6"
        >
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-950/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

            <div className="flex items-start gap-3.5">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" />

                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-[success-pop_0.4s_ease-out]">
                  ✓
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-white">
                  Profile Saved
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Your studio profile has been updated
                  successfully.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSuccessToast(false)
                }
                className="rounded-lg p-1 text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                aria-label="Dismiss success message"
              >
                ×
              </button>
            </div>

            <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-zinc-900">
              <div className="h-full origin-left animate-[success-progress_4s_linear] bg-emerald-500/60" />
            </div>
          </div>
        </div>
      )}

      {showPremiumModal && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm animate-[premium-overlay-in_0.2s_ease-out]"
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            ref={premiumModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-modal-title"
            aria-describedby="premium-modal-description"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-gradient-to-br from-[#1a1409] via-[#0d0d0d] to-[#150f05] p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.7)] outline-none animate-[premium-modal-in_0.3s_cubic-bezier(0.16,1,0.3,1)] sm:p-9"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-[#d4af37]/10 blur-3xl"
            />

            <button
              type="button"
              onClick={() => setShowPremiumModal(false)}
              aria-label="Close dialog"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            >
              ×
            </button>

            <div className="relative">
              <span className="inline-block rounded-full bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#f0d98a] px-3 py-1 text-[10px] font-bold tracking-wider text-black">
                PREMIUM
              </span>

              <h2
                id="premium-modal-title"
                className="mt-5 text-xl font-semibold text-white sm:text-2xl"
              >
                Premium Access Required
              </h2>

              <p
                id="premium-modal-description"
                className="mt-3 text-sm leading-6 text-zinc-400"
              >
                A professional website like this requires a separate
                premium website purchase. Contact our team to discuss
                your requirements and get your studio website
                developed.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowPremiumModal(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3ee27c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d] active:translate-y-0 active:scale-[0.98]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>Discuss on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowPremiumModal(false)}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-700 bg-transparent px-5 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes success-toast-in {
          0% {
            opacity: 0;
            transform: translateY(-14px) scale(0.97);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes success-pop {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }

          70% {
            opacity: 1;
            transform: scale(1.12);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes success-progress {
          0% {
            transform: scaleX(1);
          }

          100% {
            transform: scaleX(0);
          }
        }

        @keyframes premium-overlay-in {
          0% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        @keyframes premium-modal-in {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="premium-overlay-in"],
          [class*="premium-modal-in"] {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
