import SuperAdminSidebar from "@/components/super-admin/sidebar";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <SuperAdminSidebar />

            <main className="ml-72 min-h-screen overflow-x-hidden p-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}