import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-line mb-16 sm:mb-0">
      <div className="site-wrap py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-ink-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <BrandLogo size={26} />
          <span>
            <strong className="text-ink font-semibold">Studio Apps</strong>{" "}
            <span className="text-ink-3">oleh Hammad Studio</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="min-h-11 inline-flex items-center font-medium hover:text-ink">
            Katalog
          </Link>
          <Link href="/panduan" className="min-h-11 inline-flex items-center font-medium hover:text-ink">
            Panduan instalasi
          </Link>
          <Link href="/dashboard" className="min-h-11 inline-flex items-center font-medium hover:text-ink">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
