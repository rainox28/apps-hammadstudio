import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { BrandLogo } from "@/components/BrandLogo";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-white">
      <div className="relative md:flex-1 bg-night text-white px-6 py-8 sm:px-12 sm:py-10 flex flex-col overflow-hidden min-h-[300px] md:min-h-dvh">
        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5 text-lg font-bold">
          <BrandLogo size={32} />
          Studio Apps
        </Link>
        <div aria-hidden="true" className="relative flex-1 hidden md:flex items-center justify-center py-10">
          <img
            src="/artwork/wisata.webp"
            alt=""
            width={300}
            height={188}
            className="absolute w-[52%] max-w-[300px] aspect-[16/10] object-cover rounded-[10px] -translate-x-[38%] -translate-y-[30%] -rotate-[7deg] shadow-[0_14px_36px_rgba(0,0,0,0.5)]"
          />
          <img
            src="/artwork/heroMobile.webp"
            alt=""
            width={300}
            height={188}
            className="absolute w-[52%] max-w-[300px] aspect-[16/10] object-cover rounded-[10px] translate-x-[40%] translate-y-[26%] rotate-6 shadow-[0_14px_36px_rgba(0,0,0,0.5)]"
          />
          <img
            src="/artwork/martaboy.webp"
            alt=""
            width={340}
            height={212}
            className="relative w-[60%] max-w-[340px] aspect-[16/10] object-cover glow-frame"
          />
        </div>
        <div className="relative z-10 mt-auto md:mt-0 pt-10 md:pt-0">
          <p className="text-[1.6rem] font-extrabold tracking-[-0.02em]">Ruang rilis Hammad Studio</p>
          <p className="mt-1 text-[15px] text-night-mute">Unggah build, atur status, dan bagikan ke penguji.</p>
        </div>
      </div>

      <main className="md:flex-1 flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-[380px]">
          <h1 className="text-[1.9rem] font-extrabold tracking-[-0.02em]">Masuk</h1>
          <p className="mt-1 mb-7 text-[15px] text-ink-3">Khusus admin Hammad Studio.</p>
          <LoginForm />
          <Link
            href="/"
            className="mt-4 flex justify-center min-h-11 items-center text-sm font-semibold text-accent hover:text-accent-hover"
          >
            ← Kembali ke katalog
          </Link>
        </div>
      </main>
    </div>
  );
}
