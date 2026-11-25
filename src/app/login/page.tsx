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
    <div className="min-h-dvh flex flex-col bg-[#F8FAF9] px-4 py-10">
      <div className="max-w-md w-full m-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-sm font-bold text-[#111815] hover:text-[#017A56]"
          >
            <BrandLogo size={32} />
            <span>apps.hammad.studio</span>
          </Link>
          <Link
            href="/"
            className="min-h-11 inline-flex items-center text-xs font-semibold text-[#48544E] hover:text-[#111815]"
          >
            Kembali ke Katalog
          </Link>
        </div>

        <main className="rounded-3xl border border-[#E2E8E5] bg-white p-6 sm:p-8 play-card-elevation">
          <div className="flex items-center gap-3 mb-4">
            <BrandLogo size={42} />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111815] tracking-tight">
                Studio Console
              </h1>
              <p className="text-xs text-[#48544E]">
                Masuk untuk mengelola katalog &amp; rilis APK
              </p>
            </div>
          </div>

          <LoginForm />
        </main>
      </div>
    </div>
  );
}
