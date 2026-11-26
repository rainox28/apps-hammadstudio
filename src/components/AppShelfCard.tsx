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
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white hover:border-accent hover:shadow-[0_6px_18px_rgba(17,24,21,0.06)] transition-all duration-200 tactile-press"
    >
      {app.bannerUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden border-b border-line bg-raised">
          <img
            src={app.bannerUrl}
            alt={`Banner ${app.name}`}
            width={640}
            height={360}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-start gap-3.5">
          <AppIcon name={app.name} iconUrl={app.iconUrl} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-ink group-hover:text-accent truncate transition-colors">
              {app.name}
            </h3>
            <p className="text-xs font-medium text-ink-2 truncate mt-0.5">
              {app.developerName} · {app.category}
            </p>
            <p className="text-sm text-ink-2 line-clamp-2 mt-2 leading-snug">
              {app.tagline}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {latest ? (
              <>
                <TrackBadge track={latest.track} />
                <span className="font-semibold text-ink truncate tabular-nums">
                  v{latest.versionName}
                </span>
              </>
            ) : (
              <span className="text-ink-2">Belum ada APK</span>
            )}
          </div>
          <span className="text-ink-2 shrink-0 tabular-nums">
            {latest ? `${latest.fileSizeLabel} · ${app.downloadCount}x` : app.minAndroid}
          </span>
        </div>
      </div>
    </Link>
  );
}
