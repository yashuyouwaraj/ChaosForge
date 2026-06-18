"use client";

import { useState } from "react";
import { KeyRound, Lock, Save } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function PasswordCard() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.warning("Missing password details", "Fill all password fields.");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.warning("Password too short", "Use at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.warning("Passwords do not match", "Confirm your new password again.");
      return;
    }

    try {
      setSaving(true);
      await api("/auth/change-password", "PATCH", form);
      setForm(initialForm);
      toast.success("Password changed successfully.");
    } catch (err) {
      toast.error("Could not change password", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-[32px] p-8">
      <div className="flex items-center gap-3">
        <KeyRound className="h-7 w-7 cf-accent-text" />

        <h2 className="text-3xl font-black">Password</h2>
      </div>

      <p className="mt-3 text-muted-foreground">
        Change your account password.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <PasswordField
          label="Current Password"
          value={form.currentPassword}
          onChange={(value) => updateField("currentPassword", value)}
          autoComplete="current-password"
        />

        <PasswordField
          label="New Password"
          value={form.newPassword}
          onChange={(value) => updateField("newPassword", value)}
          autoComplete="new-password"
        />

        <PasswordField
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={(value) => updateField("confirmPassword", value)}
          autoComplete="new-password"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="
            inline-flex items-center gap-2 rounded-full
            px-5 py-3 text-sm font-bold
            cf-accent-bg text-slate-950
            transition hover:scale-[1.02]
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          <Save className="h-4 w-4" />
          {saving ? "Changing..." : "Change password"}
        </button>
      </div>
    </form>
  );
}

function PasswordField({ label, value, onChange, autoComplete }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <Lock className="h-4 w-4 cf-accent-text" />
        {label}
      </span>

      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="
          mt-3 h-12 w-full rounded-2xl
          border border-white/10 bg-black/20
          px-4 text-sm
          outline-none transition
          focus:border-[var(--accent-border)]
          focus:ring-2 focus:ring-[var(--accent-glow)]
        "
      />
    </label>
  );
}
