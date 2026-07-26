export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 animate-pulse rounded-lg bg-[var(--muted)]" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-[var(--muted)]" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-[var(--muted)]" />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--muted)]" />
            </div>
            <div className="h-7 w-28 animate-pulse rounded bg-[var(--muted)] mt-2" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <div className="h-5 w-32 animate-pulse rounded bg-[var(--muted)] mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-[var(--muted)]" />
                <div className="h-4 w-24 animate-pulse rounded bg-[var(--muted)]" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-[var(--muted)]" />
                <div className="h-4 w-24 animate-pulse rounded bg-[var(--muted)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <div className="h-5 w-40 animate-pulse rounded bg-[var(--muted)] mb-4" />
            <div className="h-[250px] animate-pulse rounded-lg bg-[var(--muted)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
