"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import PicknovateLoader from "@/components/admin/picknovate-loader";

type PackageItem = {
  id: string;
  name: string;
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

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<ProfileData>(emptyProfile);

    const [selectedTemplate, setSelectedTemplate] =
    useState("template-1");

    const [savingTemplate, setSavingTemplate] = useState(false);

    const [publishing, setPublishing] = useState(false);

    const [isPublished, setIsPublished] = useState(false);
    const [publicSlug, setPublicSlug] = useState("");

    const [fieldErrors, setFieldErrors] =
      useState<FieldErrors>({});

    async function handleTemplateSelect(templateKey: string) {
  if (savingTemplate || templateKey === selectedTemplate) return;

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

    setError(
      err instanceof Error
        ? err.message
        : "Failed to update template."
    );
  } finally {
    setSavingTemplate(false);
  }
}
    
const handlePublishToggle = async () => {
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

        {/* Website Template Selection */}
<section className="rounded-2xl border border-white/10 bg-[#111] p-6">
  <div className="mb-5">
    <h2 className="text-lg font-semibold text-white">
      Website Template
    </h2>
    <p className="mt-1 text-sm text-gray-400">
      Choose the design for your public studio profile.
    </p>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {profileTemplates.map((template) => (
      <button
        key={template.key}
        type="button"
        onClick={() => handleTemplateSelect(template.key)}
disabled={savingTemplate}
        className={`rounded-xl border p-4 text-left transition ${
          selectedTemplate === template.key
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

        {selectedTemplate === template.key && (
          <p className="mt-3 text-xs font-semibold text-yellow-500">
            SELECTED
          </p>
        )}
      </button>
    ))}
  </div>
</section>



      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold text-white">
        Publish Studio Website
      </h2>

      <p className="mt-1 text-sm text-zinc-400">
        Make your studio website publicly accessible through a shareable link.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isPublished ? "bg-green-500" : "bg-zinc-500"
          }`}
        />
        <span className="text-sm text-zinc-300">
          {isPublished ? "Website Published" : "Website Not Published"}
        </span>
      </div>

      {isPublished && publicSlug && (
        <a
          href={`/studio/${publicSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block break-all text-sm text-yellow-400 hover:text-yellow-300"
        >
          {`/studio/${publicSlug}`}
        </a>
      )}
    </div>

    <button
      type="button"
      onClick={handlePublishToggle}
      disabled={publishing}
      className={`rounded-xl px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        isPublished
          ? "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "bg-yellow-400 text-black hover:bg-yellow-300"
      }`}
    >
      {publishing
        ? "Please wait..."
        : isPublished
          ? "Unpublish Website"
          : "Publish Website"}
    </button>
  </div>
</div>

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
                Other Link
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
      `}</style>
    </main>
  );
}
