import PicknovateLoader from "@/components/admin/picknovate-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black lg:min-h-screen">
      <PicknovateLoader />
    </div>
  );
}