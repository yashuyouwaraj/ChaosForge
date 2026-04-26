"use client";

import { useState } from "react";
import { api } from "../../lib/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api("/auth/signup", "POST", { email, password });
      alert("Signup successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl">
        <h1 className="mb-4 text-xl">Create Account</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block mb-2 p-2"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block mb-4 p-2"
        />

        <button onClick={handleSignup} disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {error ? <p className="mt-3 text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}