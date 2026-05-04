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
    <div className="grid grid-cols-3 gap-1.5">
      {statuses.map((status) => (
        <div
          key={status}
          className="rounded-md border border-white/10 bg-neutral-950/85 px-2 py-1 text-center"
        >
          <p className="text-sm font-semibold leading-none text-white">
            {statusCounts[status]}
          </p>
          <p className="mt-1 text-[10px] leading-none text-neutral-400">
            {status}
          </p>
        </div>
      ))}
    </div>
  );
}
