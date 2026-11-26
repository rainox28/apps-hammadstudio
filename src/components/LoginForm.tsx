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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-[10px] bg-[#FBECEA] px-4 py-3 text-sm text-[#A3261B]"
        >
          <span className="font-semibold">Gagal masuk: </span>
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="login-email"
          className="block text-[13px] font-semibold text-ink mb-2"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@hammad.studio"
          className="w-full h-12 px-4 rounded-[12px] border border-line-strong bg-white text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-3 focus:ring-glow/40"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-[13px] font-semibold text-ink mb-2"
        >
          Kata sandi
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
            className="w-full h-12 pl-4 pr-24 rounded-[12px] border border-line-strong bg-white text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-3 focus:ring-glow/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 h-8 px-3 rounded-full text-xs font-semibold text-ink-2 hover:bg-raised hover:text-ink"
          >
            {showPassword ? "Sembunyi" : "Tampilkan"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-[50px] rounded-full bg-accent text-white text-[15px] font-bold hover:bg-accent-hover disabled:opacity-60 tactile-press"
      >
        {loading ? "Memeriksa akun…" : "Masuk"}
      </button>
    </form>
  );
}
