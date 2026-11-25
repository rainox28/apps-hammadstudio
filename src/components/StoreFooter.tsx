import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-[#E2E8E5] bg-[#F8FAF9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <BrandLogo size={32} />
          <div>
            <p className="text-sm font-bold text-[#111815]">apps.hammad.studio</p>
            <p className="text-xs text-[#48544E] mt-0.5">
              Pusat unduhan APK Android prarilis untuk klien &amp; penguji sebelum rilis Google Play.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <Link
            href="/"
            className="min-h-11 inline-flex items-center text-[#48544E] hover:text-[#111815] font-medium"
          >
            Katalog
          </Link>
          <Link
            href="/panduan"
            className="min-h-11 inline-flex items-center text-[#48544E] hover:text-[#111815] font-medium"
          >
            Panduan Pasang APK
          </Link>
          <Link
            href="/dashboard"
            className="min-h-11 inline-flex items-center text-[#48544E] hover:text-[#111815] font-medium"
          >
            Studio Console
          </Link>
        </div>
      </div>
    </footer>
  );
}
