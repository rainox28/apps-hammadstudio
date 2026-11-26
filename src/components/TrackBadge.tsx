import { getTrackMeta } from "@/lib/constants";

interface TrackBadgeProps {
  track: string;
}

/** Release track label with the shared status dot (amber = uji, green = siap). */
export function TrackBadge({ track }: TrackBadgeProps) {
  const meta = getTrackMeta(track);
  const stage =
    meta.tone === "emerald" ? "ready" : meta.tone === "amber" ? "beta" : "soon";

  return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-semibold rounded-full bg-raised text-ink-2">
      <span aria-hidden="true" className="status-dot" data-stage={stage} />
      {meta.label}
    </span>
  );
}
