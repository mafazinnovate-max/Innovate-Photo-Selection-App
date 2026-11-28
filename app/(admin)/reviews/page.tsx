import ReviewForm from "@/components/admin/review-form";

export default function ReviewPage() {
  return (
    <main className="bg-black px-4 py-6">
  <h1 className="mb-6 text-center text-2xl font-semibold text-white">
        Share your experiencee
      </h1>
      <ReviewForm />
    </main>
  );
}