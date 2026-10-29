export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-9 w-40 rounded-lg bg-zinc-800" />
        <div className="mt-3 h-4 w-72 rounded bg-zinc-900" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-zinc-800" />
                <div className="h-9 w-20 rounded bg-zinc-800" />
                <div className="h-3 w-32 rounded bg-zinc-800" />
              </div>

              <div className="h-11 w-11 rounded-xl bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Subscription */}
      <div className="h-48 rounded-2xl border border-zinc-800 bg-zinc-900" />

      {/* Recent Events */}
      <div>
        <div className="mb-4">
          <div className="h-6 w-40 rounded bg-zinc-800" />
          <div className="mt-2 h-4 w-56 rounded bg-zinc-900" />
        </div>

        <div className="h-64 rounded-2xl border border-zinc-800 bg-zinc-900/50" />
      </div>

      {/* Section transition */}
      <div className="h-px bg-zinc-800" />

      {/* Past Events */}
      <div>
        <div className="mb-4">
          <div className="h-6 w-32 rounded bg-zinc-800" />
          <div className="mt-2 h-4 w-72 rounded bg-zinc-900" />
        </div>

        <div className="h-64 rounded-2xl border border-zinc-800 bg-zinc-900/50" />
      </div>
    </div>
  );
}