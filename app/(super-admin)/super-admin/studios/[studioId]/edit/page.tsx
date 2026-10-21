import { notFound } from "next/navigation";

import StudioForm, {
    StudioFormData,
    StudioPlan,
    StudioStatus,
} from "@/components/super-admin/studio-form";

import { prisma } from "@/lib/prisma";

interface EditStudioPageProps {
    params: Promise<{
        studioId: string;
    }>;
}

function formatDate(date: Date | null | undefined): string {
    if (!date) return "";

    return date.toISOString().slice(0, 10);
}

export default async function EditStudioPage({
    params,
}: EditStudioPageProps) {
    const { studioId } = await params;

    const studio = await prisma.studio.findUnique({
        where: {
            id: studioId,
        },
        include: {
            admins: true,
            Subscription: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
            },
        },
    });

    // Studio database-la illana 404 page kaattum.
    if (!studio) {
        notFound();
    }

    const admin = studio.admins[0] ?? null;
    const subscription = studio.Subscription
    
    [0] ?? null;

    const studioData: StudioFormData = {
        // Studio details
        studioName: studio.name ?? "",
        studioEmail: studio.email ?? "",
        phone: studio.phone ?? "",
        address: studio.address ?? "",
        city: studio.city ?? "",
        state: studio.state ?? "",
        country: studio.country ?? "India",
        website: studio.website ?? "",
        description: studio.description ?? "",

        // Admin details
        adminName: admin?.name ?? "",
        adminUsername: admin?.username ?? "",
        adminEmail: admin?.email ?? "",
        adminPhone: admin?.phone ?? "",

        // Password edit pannumbothu empty-ah irukkattum.
        password: "",
        confirmPassword: "",

        // Subscription dates
        startDate: formatDate(subscription?.startDate),
        endDate: formatDate(subscription?.endDate),

        // Subscription limits
        storageLimit: String(subscription?.storageLimitGb ?? 100),
        maxEvents: String(subscription?.maxEvents ?? 50),
        maxCustomers: String(subscription?.maxCustomers ?? 500),
        maxImages: String(subscription?.maxImages ?? 100000),

        // Internal notes
        notes: studio.internalNotes ?? "",
    };

    const plan = (subscription?.plan ?? "Basic") as StudioPlan;
    const status = (subscription?.status ?? "Active") as StudioStatus;

    return (
        <StudioForm
            mode="edit"
            studioId={studio.id}
            initialData={studioData}
            initialPlan={plan}
            initialStatus={status}
        />
    );
}