import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-[#E4EAE6] bg-[#F5F7F6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#141917]">apps.hammad.studio</p>
          <p className="text-xs text-[#49544E] mt-1">
            Distribusi APK prarilis resmi untuk klien dan penguji internal sebelum rilis Google Play.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/"
            className="min-h-11 inline-flex items-center text-[#49544E] hover:text-[#141917] font-medium"
          >
            Katalog
          </Link>
          <Link
            href="/panduan"
            className="min-h-11 inline-flex items-center text-[#49544E] hover:text-[#141917] font-medium"
          >
            Panduan Pasang APK
          </Link>
          <Link
            href="/dashboard"
            className="min-h-11 inline-flex items-center text-[#49544E] hover:text-[#141917] font-medium"
          >
            Dashboard Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
