"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal. Periksa kembali email dan kata sandi.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Koneksi bermasalah. Silakan coba beberapa saat lagi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]"
        >
          <span className="font-semibold">Gagal masuk: </span>
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="login-email"
          className="block text-sm font-semibold text-[#141917] mb-1.5"
        >
          Email Admin
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@hammad.studio"
          className="w-full h-11 px-3.5 rounded-xl border border-[#C8D3CC] bg-white text-sm text-[#141917] placeholder:text-[#49544E]/70 focus:border-[#017A56] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-sm font-semibold text-[#141917] mb-1.5"
        >
          Kata Sandi
        </label>
        <div className="relative flex items-center">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan kata sandi"
            className="w-full h-11 pl-3.5 pr-24 rounded-xl border border-[#C8D3CC] bg-white text-sm text-[#141917] placeholder:text-[#49544E]/70 focus:border-[#017A56] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-[#49544E] hover:bg-[#F5F7F6] hover:text-[#141917]"
          >
            {showPassword ? "Sembunyi" : "Tampilkan"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346] disabled:opacity-60 tactile-press"
      >
        {loading ? "Memeriksa akun..." : "Masuk ke Dashboard"}
      </button>
    </form>
  );
}
