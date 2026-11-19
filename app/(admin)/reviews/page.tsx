import ReviewForm from "@/components/admin/review-form";

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-16">
      <h1 className="mb-8 text-center text-2xl font-semibold text-white">
        Share your experience
      </h1>
      <ReviewForm />
    </main>
  );
}