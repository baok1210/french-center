'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-lg font-semibold">Có lỗi xảy ra</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error.message || 'Vui lòng thử lại'}</p>
      <button onClick={reset} className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Thử lại
      </button>
    </div>
  );
}
