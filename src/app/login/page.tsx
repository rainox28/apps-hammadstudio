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
    <div className="min-h-dvh flex flex-col bg-[#fafbf8] px-4 py-10">
      <div className="max-w-md w-full m-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-base font-extrabold tracking-[-0.04em] text-[#18221c] hover:text-[#006c4c]"
          >
            <BrandLogo size={34} />
            <span>
              Studio <span className="text-[#006c4c]">Apps</span>
            </span>
          </Link>
          <Link
            href="/"
            className="min-h-11 inline-flex items-center text-xs font-semibold text-[#52625a] hover:text-[#18221c]"
          >
            Kembali ke Katalog
          </Link>
        </div>

        <main className="rounded-[22px] border border-[#dce3da] bg-white p-6 sm:p-8 shadow-[0_4px_16px_rgba(24,34,28,0.04)]">
          <div className="flex items-center gap-3 mb-5">
            <BrandLogo size={42} />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#18221c] tracking-[-0.04em]">
                Studio Console
              </h1>
              <p className="text-xs text-[#52625a]">
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
