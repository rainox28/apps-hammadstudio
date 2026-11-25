import Link from "next/link";
import type { AppWithLatestRelease } from "@/db/queries";
import { AppIcon } from "./AppIcon";
import { TrackBadge } from "./TrackBadge";

interface AppShelfCardProps {
  app: AppWithLatestRelease;
}

export function AppShelfCard({ app }: AppShelfCardProps) {
  const latest = app.latestRelease;

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex flex-col justify-between p-4 rounded-2xl border border-[#E4EAE6] bg-white hover:border-[#017A56] hover:bg-[#FAFDFB] transition-colors tactile-press"
    >
      <div className="flex items-start gap-3.5">
        <AppIcon name={app.name} iconUrl={app.iconUrl} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#141917] group-hover:text-[#017A56] truncate transition-colors">
            {app.name}
          </h3>
          <p className="text-xs font-medium text-[#49544E] truncate mt-0.5">
            {app.developerName} · {app.category}
          </p>
          <p className="text-sm text-[#49544E] line-clamp-2 mt-2 leading-snug">
            {app.tagline}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E4EAE6] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {latest ? (
            <>
              <TrackBadge track={latest.track} />
              <span className="font-semibold text-[#141917] truncate">
                v{latest.versionName}
              </span>
            </>
          ) : (
            <span className="text-[#49544E]">Belum ada APK</span>
          )}
        </div>
        <span className="text-[#49544E] shrink-0 tabular-nums">
          {latest ? latest.fileSizeLabel : app.minAndroid}
        </span>
      </div>
    </Link>
  );
}
