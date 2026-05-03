import type { ReviewStatus } from "@/types/video";

type StatusSummaryProps = {
  statusCounts: Record<ReviewStatus, number>;
  statuses: ReviewStatus[];
};

export default function StatusSummary({
  statusCounts,
  statuses,
}: StatusSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-neutral-900 p-2">
      {statuses.map((status) => (
        <div
          key={status}
          className="rounded-md bg-neutral-950 px-2 py-3 text-center"
        >
          <p className="text-lg font-semibold text-white">
            {statusCounts[status]}
          </p>
          <p className="mt-1 text-xs text-neutral-400">{status}</p>
        </div>
      ))}
    </div>
  );
}
