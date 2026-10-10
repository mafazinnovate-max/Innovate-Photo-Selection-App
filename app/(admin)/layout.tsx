
import Sidebar from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-72 lg:p-8">
        <div className="mx-auto w-full max-w-[1800px]">
          {children}
        </div>
      </main>
    </div>
  );
}