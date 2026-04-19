"use client";

import { useState } from "react";
import { api } from "../../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      const res = await api("/auth/login", "POST", { email, password });

      localStorage.setItem("token", res.token);

      window.location.href = "/projects";
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl">
        <h1 className="mb-4">Login</h1>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="block mb-2 p-2"
        />

        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="block mb-4 p-2"
        />

        <button onClick={handleLogin}>Login</button>
        {error ? <p className="mt-3 text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
