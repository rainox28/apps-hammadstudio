import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#F5F7F6] px-4 py-10">
      <div className="max-w-md w-full m-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#141917] hover:text-[#017A56]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
            >
              <rect width="28" height="28" rx="7" fill="#017A56" />
              <path d="M9.5 7.5L21 14L9.5 20.5V7.5Z" fill="#FFFFFF" />
            </svg>
            <span>apps.hammad.studio</span>
          </Link>
          <Link
            href="/"
            className="min-h-11 inline-flex items-center text-xs font-semibold text-[#49544E] hover:text-[#141917]"
          >
            Kembali ke Katalog
          </Link>
        </div>

        <main className="rounded-2xl border border-[#E4EAE6] bg-white p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#141917] tracking-tight">
            Masuk Dashboard Pengelola
          </h1>
          <p className="text-sm text-[#49544E] mt-1.5 mb-6">
            Kelola daftar proyek aplikasi Android, ikon, tangkapan layar, dan versi rilis APK.
          </p>

          <LoginForm />
        </main>
      </div>
    </div>
  );
}
