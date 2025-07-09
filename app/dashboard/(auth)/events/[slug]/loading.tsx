export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex flex-row items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-96 animate-pulse rounded bg-muted"></div>
          <div className="space-y-1">
            <div className="h-4 w-64 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-48 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-10 w-20 animate-pulse rounded bg-muted"></div>
          <div className="h-10 w-10 animate-pulse rounded bg-muted"></div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Image gallery skeleton */}
        <div className="min-w-0 xl:col-span-1">
          <div className="h-96 w-full animate-pulse rounded-lg bg-muted"></div>
        </div>

        <div className="space-y-4 xl:col-span-2">
          {/* Metrics bar skeleton */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-6 animate-pulse rounded bg-muted-foreground/20"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/20"></div>
                    <div className="h-6 w-20 animate-pulse rounded bg-muted-foreground/20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                <div className="space-y-1">
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-32 animate-pulse rounded bg-muted"></div>
                <div className="space-y-1">
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-4/6 animate-pulse rounded bg-muted"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}