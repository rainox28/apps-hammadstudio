import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-[#dde4d9] mb-16 sm:mb-0">
      <div className="site-wrap py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[#52625a]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <BrandLogo size={26} />
          <span>
            <strong className="text-[#26392c] font-bold">Studio Apps</strong>
            <span className="px-2 text-[#889286]">·</span>
            Hammad Studio
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="min-h-11 inline-flex items-center font-semibold hover:underline">
            Katalog
          </Link>
          <Link href="/panduan" className="min-h-11 inline-flex items-center font-semibold hover:underline">
            Panduan instalasi
          </Link>
          <Link href="/dashboard" className="min-h-11 inline-flex items-center font-semibold hover:underline">
            Studio Console
          </Link>
        </div>
      </div>
    </footer>
  );
}
