export default function TransactionsLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center justify-between p-6">
          <div className="h-6 w-32 animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--muted)]" />
        </div>
        <div className="px-6 pb-6">
          <div className="mb-4 space-y-3">
            <div className="h-10 w-full animate-pulse rounded-lg bg-[var(--muted)]" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-32 animate-pulse rounded-lg bg-[var(--muted)]"
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3"
              >
                <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--muted)]" />
                <div className="flex-1">
                  <div className="h-4 w-48 animate-pulse rounded bg-[var(--muted)]" />
                  <div className="mt-1 h-3 w-32 animate-pulse rounded bg-[var(--muted)]" />
                </div>
                <div className="text-right">
                  <div className="h-4 w-20 animate-pulse rounded bg-[var(--muted)]" />
                  <div className="mt-1 h-5 w-16 animate-pulse rounded-full bg-[var(--muted)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
