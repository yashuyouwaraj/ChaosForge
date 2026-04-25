"use client";

import { useState } from "react";
import { api } from "../../lib/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    await api("/auth/signup", "POST", { email, password });

    alert("Signup successful! Please login.");

    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl">
        <h1 className="mb-4 text-xl">Create Account</h1>

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

        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}