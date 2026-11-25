import { getTrackMeta } from "@/lib/constants";

interface TrackBadgeProps {
  track: string;
}

export function TrackBadge({ track }: TrackBadgeProps) {
  const meta = getTrackMeta(track);

  const toneClass =
    meta.tone === "emerald"
      ? "bg-[#E6F4EE] text-[#017A56] border-[#B7DFCE]"
      : meta.tone === "amber"
      ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
      : "bg-[#F5F7F6] text-[#49544E] border-[#E4EAE6]";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md border ${toneClass}`}
    >
      {meta.label}
    </span>
  );
}
