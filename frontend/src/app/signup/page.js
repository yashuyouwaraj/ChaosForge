"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      window.location.href = "/projects";
    }
  }, []);

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Enter an email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api("/auth/signup", "POST", { email, password });
      const res = await api("/auth/login", "POST", { email, password });
      localStorage.setItem("token", res.token);
      window.location.href = "/projects";
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            ChaosForge
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Create your workspace for traffic tests.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Register once, then jump straight into projects where each run keeps
            its own logs, metrics, charts, and controls.
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="rounded-lg border border-slate-700 bg-slate-900/80 p-7 shadow-2xl shadow-emerald-950/30"
        >
          <div className="mb-7">
            <h2 className="text-2xl font-semibold text-white">Register</h2>
            <p className="mt-2 text-sm text-slate-400">
              Already have an account?{" "}
              <Link className="font-medium text-emerald-300 hover:text-emerald-200" href="/login">
                Login instead
              </Link>
            </p>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="Choose a password"
            />
          </label>

          {error ? (
            <p className="mb-4 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      </section>
    </main>
  );
}
