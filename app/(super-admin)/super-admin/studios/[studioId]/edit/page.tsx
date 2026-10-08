import StudioForm, {
    StudioFormData,
    StudioPlan,
    StudioStatus,
} from "@/components/super-admin/studio-form";

interface EditStudioPageProps {
    params: Promise<{
        studioId: string;
    }>;
}

const studioData: StudioFormData = {
    studioName: "Innovate Wedding Studio",
    studioEmail: "hello@innovatewedding.com",
    phone: "+91 98765 43210",
    address: "Main Road, Nagercoil",
    city: "Nagercoil",
    state: "Tamil Nadu",
    country: "India",
    website: "https://innovatewedding.com",
    description:
        "Professional wedding photography and videography studio managing wedding events, customer galleries and photo selections.",

    adminName: "Mafaz Malik",
    adminEmail: "admin@innovatewedding.com",
    adminPhone: "+91 98765 43210",

    // Password intentionally empty while editing.
    password: "",
    confirmPassword: "",

    startDate: "2026-06-01",
    endDate: "2027-05-31",

    storageLimit: "100",
    maxEvents: "50",
    maxCustomers: "500",
    maxImages: "100000",

    notes:
        "Primary demo studio. Currently using the Professional plan.",
};

export default async function EditStudioPage({
    params,
}: EditStudioPageProps) {
    const { studioId } = await params;

    /*
     * UI ONLY FOR NOW.
     *
     * Later:
     * const studio = await getStudioById(studioId)
     *
     * Then pass the DB values into StudioForm.
     */

    const plan: StudioPlan = "Professional";
    const status: StudioStatus = "Active";

    return (
        <StudioForm
            mode="edit"
            studioId={studioId}
            initialData={studioData}
            initialPlan={plan}
            initialStatus={status}
        />
    );
}